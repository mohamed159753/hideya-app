const FinalResult = require('../models/FinalResult');
const Participation = require('../models/Participation');
const mongoose = require('mongoose');

// Middleware to check if user is admin (add this to your auth middleware)
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Helper function to extract subCategory from entries
const extractSubCategoryFromEntries = async (result) => {
  if (!result.entries || result.entries.length === 0) {
    return null;
  }
  
  // Get the first participation to extract subCategory
  const firstParticipationId = result.entries[0].participationId;
  if (!firstParticipationId) return null;
  
  try {
    const participation = await Participation.findById(firstParticipationId).select('subCategory');
    return participation?.subCategory || null;
  } catch (err) {
    console.error('Error fetching participation for subCategory:', err);
    return null;
  }
};

// GET /api/admin/results - Get all results with optional filters
exports.getAllResults = async (req, res) => {
  try {
    const { competitionId, categoryId, subCategory, limit, skip } = req.query;
    
    const filter = {};
    if (competitionId) filter.competitionId = competitionId;
    if (categoryId) filter.categoryId = categoryId;

    const query = FinalResult.find(filter)
      .populate('competitionId', 'title description')
      .populate('categoryId', 'name description')
      .populate('generatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    if (limit) query.limit(parseInt(limit));
    if (skip) query.skip(parseInt(skip));

    const results = await query.exec();

    // Add entries count and subCategory to each result
    const resultsWithMetadata = await Promise.all(results.map(async (r) => {
      const subCat = await extractSubCategoryFromEntries(r);
      return {
        ...r.toObject(),
        entriesCount: r.entries?.length || 0,
        subCategory: subCat
      };
    }));

    // Filter by subCategory if provided
    let filteredResults = resultsWithMetadata;
    if (subCategory) {
      filteredResults = resultsWithMetadata.filter(r => r.subCategory === subCategory);
    }

    return res.json(filteredResults);
  } catch (err) {
    console.error('Error fetching all results:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/:id - Get single result by ID
exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid result ID' });
    }

    const result = await FinalResult.findById(id)
      .populate('competitionId', 'title description')
      .populate('categoryId', 'name description')
      .populate('generatedBy', 'firstName lastName email');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Add subCategory from participation
    const subCategory = await extractSubCategoryFromEntries(result);
    const resultWithSubCategory = {
      ...result.toObject(),
      subCategory
    };

    return res.json(resultWithSubCategory);
  } catch (err) {
    console.error('Error fetching result:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/results/:id - Delete a result
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid result ID' });
    }

    const result = await FinalResult.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    return res.json({ 
      message: 'Result deleted successfully',
      deletedResult: result 
    });
  } catch (err) {
    console.error('Error deleting result:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/statistics - Get overall statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalResults = await FinalResult.countDocuments();
    
    const competitionStats = await FinalResult.aggregate([
      {
        $group: {
          _id: '$competitionId',
          count: { $sum: 1 },
          totalParticipants: { $sum: { $size: '$entries' } }
        }
      },
      {
        $lookup: {
          from: 'competitions',
          localField: '_id',
          foreignField: '_id',
          as: 'competition'
        }
      },
      {
        $unwind: { path: '$competition', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          competitionId: '$_id',
          competitionName: '$competition.title',
          resultsCount: '$count',
          totalParticipants: 1
        }
      }
    ]);

    const categoryStats = await FinalResult.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$category.name',
          resultsCount: '$count'
        }
      }
    ]);

    const recentResults = await FinalResult.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('competitionId', 'title')
      .populate('categoryId', 'name')
      .populate('generatedBy', 'firstName lastName');

    return res.json({
      totalResults,
      competitionStats,
      categoryStats,
      recentResults
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/competition/:competitionId
exports.getResultsByCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid competition ID' });
    }

    const results = await FinalResult.find({ competitionId })
      .populate('categoryId', 'name')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Add subCategory to each result
    const resultsWithSubCategory = await Promise.all(results.map(async (r) => {
      const subCat = await extractSubCategoryFromEntries(r);
      return {
        ...r.toObject(),
        subCategory: subCat
      };
    }));

    return res.json(resultsWithSubCategory);
  } catch (err) {
    console.error('Error fetching results by competition:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/category/:categoryId
exports.getResultsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const results = await FinalResult.find({ categoryId })
      .populate('competitionId', 'title')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Add subCategory to each result
    const resultsWithSubCategory = await Promise.all(results.map(async (r) => {
      const subCat = await extractSubCategoryFromEntries(r);
      return {
        ...r.toObject(),
        subCategory: subCat
      };
    }));

    return res.json(resultsWithSubCategory);
  } catch (err) {
    console.error('Error fetching results by category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/history
exports.getResultHistory = async (req, res) => {
  try {
    const { competitionId, categoryId, subCategory } = req.query;
    
    if (!competitionId || !categoryId) {
      return res.status(400).json({ 
        message: 'competitionId and categoryId are required' 
      });
    }

    const filter = { competitionId, categoryId };

    const results = await FinalResult.find(filter)
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Add subCategory and filter if needed
    let resultsWithSubCategory = await Promise.all(results.map(async (r) => {
      const subCat = await extractSubCategoryFromEntries(r);
      return {
        ...r.toObject(),
        subCategory: subCat
      };
    }));

    // Filter by subCategory if provided
    if (subCategory) {
      resultsWithSubCategory = resultsWithSubCategory.filter(r => r.subCategory === subCategory);
    }

    return res.json(resultsWithSubCategory);
  } catch (err) {
    console.error('Error fetching result history:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/export - Export multiple results
exports.exportResults = async (req, res) => {
  try {
    const { competitionId, categoryId, subCategory, format = 'excel' } = req.query;
    
    const filter = {};
    if (competitionId) filter.competitionId = competitionId;
    if (categoryId) filter.categoryId = categoryId;

    const results = await FinalResult.find(filter)
      .populate('competitionId', 'title')
      .populate('categoryId', 'name')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Add subCategory and filter
    let resultsWithSubCategory = await Promise.all(results.map(async (r) => {
      const subCat = await extractSubCategoryFromEntries(r);
      return {
        ...r.toObject(),
        subCategory: subCat
      };
    }));

    if (subCategory) {
      resultsWithSubCategory = resultsWithSubCategory.filter(r => r.subCategory === subCategory);
    }

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('النتائج');

      // Add headers
      worksheet.columns = [
        { header: 'المسابقة', key: 'competition', width: 20 },
        { header: 'الفئة', key: 'category', width: 20 },
        { header: 'الفئة الفرعية', key: 'subCategory', width: 15 },
        { header: 'عدد المشاركين', key: 'participants', width: 15 },
        { header: 'تم الإنشاء بواسطة', key: 'createdBy', width: 20 },
        { header: 'التاريخ', key: 'date', width: 20 }
      ];

      // Add data
      resultsWithSubCategory.forEach(r => {
        worksheet.addRow({
          competition: r.competitionId?.title || 'غير محدد',
          category: r.categoryId?.name || 'غير محدد',
          subCategory: r.subCategory || '-',
          participants: r.entries?.length || 0,
          createdBy: `${r.generatedBy?.firstName || ''} ${r.generatedBy?.lastName || ''}`,
          date: new Date(r.createdAt).toLocaleDateString('ar-EG')
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=results_${Date.now()}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      return res.json(resultsWithSubCategory);
    }
  } catch (err) {
    console.error('Error exporting results:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/results/:id/export - Export single result
exports.exportSingleResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'excel' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid result ID' });
    }

    const result = await FinalResult.findById(id)
      .populate('competitionId', 'title')
      .populate('categoryId', 'name')
      .populate('generatedBy', 'firstName lastName');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Get subCategory
    const subCategory = await extractSubCategoryFromEntries(result);

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('النتيجة');

      // Add title
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = `نتائج ${result.competitionId?.title || 'المسابقة'} - ${result.categoryId?.name || 'الفئة'}${subCategory ? ' - ' + subCategory : ''}`;
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      // Add headers
      worksheet.getRow(3).values = [
        'الترتيب',
        'اسم المشارك',
        'المتوسط النهائي',
        'حاصل الحفظ',
        'حاصل التجويد',
        'تقييم الأداء',
        'عدد المقيمين'
      ];
      worksheet.getRow(3).font = { bold: true };

      // Add data
      result.entries.forEach((entry, index) => {
        worksheet.addRow([
          index + 1,
          `${entry.competitorSnapshot?.firstName || ''} ${entry.competitorSnapshot?.lastName || ''}`,
          entry.avg?.total || 0,
          entry.avg?.memorization || 0,
          entry.avg?.tajweed || 0,
          entry.avg?.performance || 0,
          entry.count || 0
        ]);
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=result_${id}_${Date.now()}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      return res.status(501).json({ message: 'PDF export not yet implemented' });
    } else {
      return res.json({
        ...result.toObject(),
        subCategory
      });
    }
  } catch (err) {
    console.error('Error exporting single result:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/results/compare - Compare multiple results
exports.compareResults = async (req, res) => {
  try {
    const { resultIds } = req.body;
    
    if (!Array.isArray(resultIds) || resultIds.length === 0) {
      return res.status(400).json({ message: 'resultIds array is required' });
    }

    const results = await FinalResult.find({ _id: { $in: resultIds } })
      .populate('competitionId', 'title')
      .populate('categoryId', 'name')
      .populate('generatedBy', 'firstName lastName');

    // Create comparison data with subCategory
    const comparison = {
      results: await Promise.all(results.map(async (r) => {
        const subCat = await extractSubCategoryFromEntries(r);
        return {
          id: r._id,
          competition: r.competitionId?.title,
          category: r.categoryId?.name,
          subCategory: subCat,
          createdAt: r.createdAt,
          participantsCount: r.entries?.length || 0,
          averageScore: r.entries?.length 
            ? r.entries.reduce((sum, e) => sum + (e.avg?.total || 0), 0) / r.entries.length
            : 0
        };
      }))
    };

    return res.json(comparison);
  } catch (err) {
    console.error('Error comparing results:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  isAdmin,
  getAllResults: exports.getAllResults,
  getResultById: exports.getResultById,
  deleteResult: exports.deleteResult,
  getStatistics: exports.getStatistics,
  getResultsByCompetition: exports.getResultsByCompetition,
  getResultsByCategory: exports.getResultsByCategory,
  getResultHistory: exports.getResultHistory,
  exportResults: exports.exportResults,
  exportSingleResult: exports.exportSingleResult,
  compareResults: exports.compareResults
};