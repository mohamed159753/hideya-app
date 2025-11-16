const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Competition = require('../models/Competition');
const Participation = require('../models/Participation');
const User = require('../models/User');
const Mark = require('../models/Mark');
const JuryAssignment = require('../models/JuryAssignment');
const Competitor = require('../models/competitor');
const Branch = require('../models/Branch');
const Category = require('../models/Category');
const AgeGroup = require('../models/AgeGroup');

// Get comprehensive dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // 1. Basic Counts
    const [
      totalCompetitions,
      activeCompetitions,
      totalParticipants,
      totalJuryMembers,
      totalBranches,
      totalCategories,
      totalAgeGroups,
      marks
    ] = await Promise.all([
      Competition.countDocuments(),
      Competition.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      Participation.countDocuments(),
      User.countDocuments({ role: 'jury' }),
      Branch.countDocuments(),
      Category.countDocuments(),
      AgeGroup.countDocuments(),
      Mark.find().populate('participationId')
    ]);

    // 2. Evaluation Statistics
    const completedEvaluations = await Mark.countDocuments({ confirmed: true });
    const pendingEvaluations = totalParticipants - completedEvaluations;

    // 3. Gender Distribution
    const genderStats = await Competitor.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const genderDistribution = {
      male: genderStats.find(g => g._id === 'ذكر')?.count || 0,
      female: genderStats.find(g => g._id === 'أنثى')?.count || 0
    };

    // 4. Age Group Distribution (from Participation with AgeGroup)
    const ageGroupDistribution = await Participation.aggregate([
      {
        $lookup: {
          from: 'competitors',
          localField: 'competitorId',
          foreignField: '_id',
          as: 'competitor'
        }
      },
      {
        $unwind: '$competitor'
      },
      {
        $bucket: {
          groupBy: '$competitor.age',
          boundaries: [0, 6, 12, 16, 25, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            ages: { $push: '$competitor.age' }
          }
        }
      }
    ]).then(groups => 
      groups.map(group => ({
        name: `${group._id}-${group._id + 5} سنة`,
        count: group.count
      }))
    );

    // 5. Category Distribution
    const categoryDistribution = await Participation.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 }
        }
      }
    ]).then(cats => 
      cats.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    );

    // 6. Branch Performance
    const branchPerformance = await Participation.aggregate([
      {
        $lookup: {
          from: 'competitors',
          localField: 'competitorId',
          foreignField: '_id',
          as: 'competitor'
        }
      },
      {
        $unwind: '$competitor'
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'competitor.branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      {
        $unwind: '$branch'
      },
      {
        $group: {
          _id: '$branch.name',
          participants: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]).then(branches => 
      branches.map(branch => ({
        name: branch._id,
        participants: branch.participants,
        averageScore: Math.round(branch.averageScore || 0)
      }))
    );

    // 7. Score Distribution
    const scoreDistribution = await Mark.aggregate([
      {
        $match: { confirmed: true }
      },
      {
        $bucket: {
          groupBy: '$total',
          boundaries: [0, 60, 70, 80, 85, 90, 95, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            scores: { $push: '$total' }
          }
        }
      }
    ]).then(scores => 
      scores.map(score => ({
        range: `${score._id}-${score._id + 4}`,
        count: score.count
      }))
    );

    // 8. Recent Activities - WITH NULL CHECKS
    const recentActivities = await Mark.find()
      .populate('juryId', 'firstName lastName')
      .populate({
        path: 'participationId',
        populate: [
          {
            path: 'competitionId',
            select: 'title'
          },
          {
            path: 'competitorId',
            select: 'firstName lastName'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10) // Get more than needed in case some are invalid
      .then(marks => marks
        .filter(mark => {
          // Filter out marks with missing data
          return mark.participationId && 
                 mark.participationId.competitionId && 
                 mark.participationId.competitorId &&
                 mark.juryId;
        })
        .slice(0, 5) // Take only first 5 valid ones
        .map(mark => ({
          id: mark._id,
          action: `تم تقييم ${mark.participationId.competitorId.firstName} ${mark.participationId.competitorId.lastName}`,
          user: `${mark.juryId.firstName} ${mark.juryId.lastName}`,
          timestamp: mark.createdAt,
          competition: mark.participationId.competitionId.title
        }))
      );

    // 9. Competition Progress - WITH NULL CHECKS
    const competitions = await Competition.find().select('title startDate endDate');
    const competitionProgress = await Promise.all(
      competitions.map(async (comp) => {
        const participations = await Participation.find({ 
          competitionId: comp._id 
        }).select('_id');
        
        const totalParticipants = participations.length;
        
        const evaluatedParticipants = await Mark.countDocuments({
          confirmed: true,
          participationId: { 
            $in: participations.map(p => p._id)
          }
        });

        const progressPercentage = totalParticipants > 0 
          ? Math.round((evaluatedParticipants / totalParticipants) * 100)
          : 0;

        return {
          competitionId: comp._id,
          competitionTitle: comp.title,
          totalParticipants,
          evaluatedParticipants,
          progressPercentage
        };
      })
    );

    res.json({
      totalCompetitions,
      activeCompetitions,
      totalParticipants,
      totalJuryMembers,
      pendingEvaluations,
      completedEvaluations,
      totalBranches,
      totalCategories,
      totalAgeGroups,
      genderDistribution,
      ageGroupDistribution,
      categoryDistribution,
      branchPerformance,
      scoreDistribution,
      recentActivities,
      competitionProgress
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Additional endpoints for specific charts
router.get('/gender-stats', async (req, res) => {
  try {
    const genderStats = await Competitor.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(genderStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gender statistics' });
  }
});

router.get('/score-distribution', async (req, res) => {
  try {
    const scoreDistribution = await Mark.aggregate([
      {
        $match: { confirmed: true }
      },
      {
        $bucket: {
          groupBy: '$total',
          boundaries: [0, 60, 70, 80, 85, 90, 95, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json(scoreDistribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch score distribution' });
  }
});

module.exports = router;