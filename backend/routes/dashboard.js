const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Competition = require('../models/competition'); 
const Participation = require('../models/Participation');
const User = require('../models/User');
const Mark = require('../models/Mark');
const JuryAssignment = require('../models/JuryAssignment');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Total competitions
    const totalCompetitions = await Competition.countDocuments();
    
    // Active competitions (current date between start and end)
    const activeCompetitions = await Competition.countDocuments({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // Total participants
    const totalParticipants = await Participation.countDocuments();

    // Total jury members
    const totalJuryMembers = await User.countDocuments({ role: 'jury' });

    // Evaluation statistics
    const totalEvaluations = await Mark.countDocuments();
    const completedEvaluations = await Mark.countDocuments({ confirmed: true });
    const pendingEvaluations = totalParticipants - completedEvaluations;

    // Recent activities (simplified - you might want a proper Activity model)
    const recentActivities = await Mark.find()
      .populate('juryId', 'firstName lastName')
      .populate({
        path: 'participationId',
        populate: {
          path: 'competitionId',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .then(marks => marks.map(mark => ({
        id: mark._id,
        action: 'Evaluation Submitted',
        user: `${mark.juryId.firstName} ${mark.juryId.lastName}`,
        timestamp: mark.createdAt,
        competition: mark.participationId.competitionId.title
      })));

    // Competition progress
    const competitions = await Competition.find().select('title startDate endDate');
    const competitionProgress = await Promise.all(
      competitions.map(async (comp) => {
        const totalParticipants = await Participation.countDocuments({ 
          competitionId: comp._id 
        });
        const evaluatedParticipants = await Mark.countDocuments({
          confirmed: true,
          participationId: { 
            $in: await Participation.find({ competitionId: comp._id }).select('_id') 
          }
        });

        const progressPercentage = totalParticipants > 0 
          ? (evaluatedParticipants / totalParticipants) * 100 
          : 0;

        return {
          competitionId: comp._id,
          competitionTitle: comp.title,
          totalParticipants,
          evaluatedParticipants,
          progressPercentage: Math.round(progressPercentage)
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
      recentActivities,
      competitionProgress
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;