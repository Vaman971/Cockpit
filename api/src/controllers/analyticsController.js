const { Sequelize, QueryTypes, Op, fn, col, literal } = require('sequelize');
const Oppurtunity = require('../models/opportunityModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const MissionCard = require('../models/missionModel');
const Expense = require('../models/expenseModel');
const InvoiceModel = require('../models/invoiceModel');
const sequelize = require('../db/connection');
const moment = require('moment');
const PurchaseOrder = require('../models/poModel');
const ForecastModel = require('../models/forecastModel');
const RevenueModel = require('../models/revenueModel');
const revenueInvoiceModel = require('../models/revenueInvoiceModel');

const oppRegionCount = async (req, res) => {
  try {
    const opportunitiesByRegion = await Oppurtunity.findAll({
      attributes: ['OpRegion', [Sequelize.fn('COUNT', Sequelize.col('OpRegion')), 'count']],
      group: ['OpRegion'],
      order: [['OpRegion', 'ASC']],
    });

    res.json(opportunitiesByRegion);
  } catch (error) {
    console.error('Error fetching opportunities grouped by region:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOpportunityCountByCluster = async (req, res) => {
  try {
    const opportunityCounts = await Oppurtunity.findAll({
      attributes: ['cluster', [sequelize.fn('COUNT', sequelize.col('id')), 'opportunityCount']],
      group: 'cluster',
    });

    res.json(opportunityCounts);
  } catch (error) {
    console.error('Error fetching opportunity counts by cluster:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectWonCountByCluster = async (req, res) => {
  try {
    const projectCounts = await Project.findAll({
      attributes: ['cluster', [sequelize.fn('COUNT', sequelize.col('id')), 'projectCount']],
      where: {
        status: true,
        active: true,
      },
      group: 'cluster',
    });

    res.json(projectCounts);
  } catch (error) {
    console.error('Error fetching opportunity won counts by cluster:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const projectStatusCount = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    // const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (currentQuarter) {
      case 1:
        startMonth = 1;
        endMonth = 3;
        break;
      case 2:
        startMonth = 4;
        endMonth = 6;
        break;
      case 3:
        startMonth = 7;
        endMonth = 9;
        break;
      case 4:
        startMonth = 10;
        endMonth = 12;
        break;
      default:
        startMonth = 1;
        endMonth = 3;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const projectsByStatus = await Project.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']],
      where: { status: true, active: true },
      group: ['status'],
      order: [['status', 'ASC']],
    });

    //  const projectstatus = await Project.findAll({where: {status: true}});
    //  console.log(projectstatus);

    const projectsByStatusLastQuarter = await Project.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']],
      group: ['status'],
      order: [['status', 'ASC']],
      where: {
        created_on: {
          [Op.between]: [startDate, endDate],
        },
        status: true,
        active: true,
      },
    });

    res.json({ projectsByStatus, projectsByStatusLastQuarter });
  } catch (error) {
    console.error('Error fetching opportunities grouped by status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const totalOpportunityCount = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    // const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (currentQuarter) {
      case 1:
        startMonth = 1;
        endMonth = 3;
        break;
      case 2:
        startMonth = 4;
        endMonth = 6;
        break;
      case 3:
        startMonth = 7;
        endMonth = 9;
        break;
      case 4:
        startMonth = 10;
        endMonth = 12;
        break;
      default:
        startMonth = 1;
        endMonth = 3;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const totalOpportunities = await Oppurtunity.count();

    const totalOpportunityLastQuarter = await Oppurtunity.findAll({
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    res.json({
      total_opportunities: totalOpportunities,
      opportunities_lastQuarter: totalOpportunityLastQuarter,
    });
  } catch (error) {
    console.error('Error fetching total number of opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const oppCreatedLastWeek = async (req, res) => {
  try {
    // Calculate the date range for the last one week
    const endDate = moment().endOf('day').toDate().toLocaleDateString('en-CA');
    const startDate = moment()
      .subtract(7, 'days')
      .startOf('day')
      .toDate()
      .toLocaleDateString('en-CA');

    const query = `SELECT 
    calendar.date as createdAt,
    COALESCE(count(id), 0) AS count
FROM 
    (
        SELECT DATE_ADD(:startDate, INTERVAL (t4*1000 + t3*100 + t2*10 + t1) DAY) AS date
        FROM
        (SELECT 0 AS t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS tens,
        (SELECT 0 AS t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS hundreds,
        (SELECT 0 AS t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS thousands,
        (SELECT 0 AS t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) AS ten_thousands
    ) calendar
    LEFT JOIN oppurtunities o ON calendar.date = DATE(o.createdAt)
WHERE 
    calendar.date BETWEEN :startDate AND :endDate
GROUP BY 
    calendar.date
ORDER BY 
    calendar.date;`;

    // Find opportunities created within the last one week
    const opportunitiesLastWeek = await sequelize.query(query, {
      replacements: { endDate, startDate },
      type: QueryTypes.SELECT,
    });

    res.json(opportunitiesLastWeek);
  } catch (error) {
    console.error('Error fetching opportunities created last week:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// opp won last week
const oppWonLastWeek = async (req, res) => {
  try {
    // Calculate the date range for the last one week
    const end = moment().endOf('day');
    const start = moment().subtract(7, 'days').startOf('day');

    console.log(
      'enddate:' +
        end.toDate().toLocaleDateString('en-CA') +
        'startdate:' +
        start.toDate().toLocaleDateString('en-CA')
    );

    const startDate = new Date().toLocaleDateString('en-CA');
    const endDate = new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString(
      'en-CA'
    );

    const query = `
    SELECT 
    calendar.date as updatedAt,
    COALESCE(SUM(CASE WHEN o.status = 'Won' THEN 1 ELSE 0 END), 0) AS count 
    FROM 
    (
        SELECT DATE_ADD(:endDate, INTERVAL (t4*1000 + t3*100 + t2*10 + t1) DAY) AS date
        FROM
        (SELECT 0 AS t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS tens,
        (SELECT 0 AS t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS hundreds,
        (SELECT 0 AS t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS thousands,
        (SELECT 0 AS t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) AS ten_thousands
    ) calendar
    LEFT JOIN oppurtunities o ON calendar.date = DATE(o.updatedAt)
WHERE 
    calendar.date BETWEEN :endDate AND :startDate
GROUP BY 
    calendar.date
ORDER BY 
    calendar.date;
    `;
    const opportunitiesWonLastWeek = await sequelize.query(query, {
      replacements: { endDate, startDate },
      type: QueryTypes.SELECT,
    });

    res.json(opportunitiesWonLastWeek);
  } catch (error) {
    console.error('Error fetching opportunities won last week:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const oppQueryCount = async (req, res) => {
  try {
    const { filter, cluster, region } = req.query;
    let query;

    if (filter === 'YEAR') {
      query = `
      WITH oppCount AS (
        SELECT
          YEAR(createdAt) AS Year,
          COUNT(*) AS oppCount
        FROM
          oppurtunities
        WHERE
          createdAt >= CURDATE() - INTERVAL 12 ${filter}
          ${cluster ? `AND cluster = '${cluster}'` : ''}
          ${region ? `AND OpRegion = '${region}'` : ''}
        GROUP BY
          YEAR(createdAt)
      )
      SELECT
        oppCount.Year,
        oppCount.oppCount,
        COALESCE(wonCount.wonCount, 0) AS wonCount,
        COALESCE(proposalCount.proposalCount, 0) AS proposalCount,
        COALESCE(prospectionCount.prospectionCount, 0) AS prospectionCount,
        COALESCE(advancedCount.advancedCount, 0) AS advancedCount,
        COALESCE(holdCount.holdCount, 0) AS holdCount
      FROM
        oppCount
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, COUNT(*) AS wonCount FROM oppurtunities WHERE status = 'Won' GROUP BY YEAR(updatedAt)) AS wonCount
      ON
        oppCount.Year = wonCount.Year
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, COUNT(*) AS proposalCount FROM oppurtunities WHERE status = 'Proposal' GROUP BY YEAR(updatedAt)) AS proposalCount
      ON
        oppCount.Year = proposalCount.Year
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, COUNT(*) AS prospectionCount FROM oppurtunities WHERE status = 'Prospection' GROUP BY YEAR(updatedAt)) AS prospectionCount
      ON
        oppCount.Year = prospectionCount.Year
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, COUNT(*) AS advancedCount FROM oppurtunities WHERE status = 'Advanced' GROUP BY YEAR(updatedAt)) AS advancedCount
      ON
        oppCount.Year = advancedCount.Year
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, COUNT(*) AS holdCount FROM oppurtunities WHERE status = 'Hold' GROUP BY YEAR(updatedAt)) AS holdCount
      ON
        oppCount.Year = holdCount.Year
      ORDER BY
        oppCount.Year DESC
    `;
    } else {
      query = `
      WITH oppCount AS (
        SELECT
          YEAR(createdAt) AS Year,
          ${
            filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
          }(createdAt) AS ${filter},
          COUNT(*) AS oppCount
        FROM
          oppurtunities
        WHERE
          createdAt >= CURDATE() - INTERVAL 12 ${filter}
          ${cluster ? `AND cluster = '${cluster}'` : ''}
          ${region ? `AND OpRegion = '${region}'` : ''}
        GROUP BY
          YEAR(createdAt),
          ${filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'}(createdAt)
      )
      SELECT
        oppCount.Year,
        oppCount.${filter},
        oppCount.oppCount,
        COALESCE(wonCount.wonCount, 0) AS wonCount,
        COALESCE(proposalCount.proposalCount, 0) AS proposalCount,
        COALESCE(prospectionCount.prospectionCount, 0) AS prospectionCount,
        COALESCE(advancedCount.advancedCount, 0) AS advancedCount,
        COALESCE(holdCount.holdCount, 0) AS holdCount
      FROM
        oppCount
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt) AS ${filter}, COUNT(*) AS wonCount FROM oppurtunities WHERE status = 'Won' GROUP BY YEAR(updatedAt), ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt)) AS wonCount
      ON
        oppCount.Year = wonCount.Year AND oppCount.${filter} = wonCount.${filter}
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt) AS ${filter}, COUNT(*) AS proposalCount FROM oppurtunities WHERE status = 'Proposal' GROUP BY YEAR(updatedAt), ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt)) AS proposalCount
      ON
        oppCount.Year = proposalCount.Year AND oppCount.${filter} = proposalCount.${filter}
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt) AS ${filter}, COUNT(*) AS prospectionCount FROM oppurtunities WHERE status = 'Prospection' GROUP BY YEAR(updatedAt), ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt)) AS prospectionCount
      ON
        oppCount.Year = prospectionCount.Year AND oppCount.${filter} = prospectionCount.${filter}
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt) AS ${filter}, COUNT(*) AS advancedCount FROM oppurtunities WHERE status = 'Advanced' GROUP BY YEAR(updatedAt), ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt)) AS advancedCount
      ON
        oppCount.Year = advancedCount.Year AND oppCount.${filter} = advancedCount.${filter}
      LEFT JOIN
        (SELECT YEAR(updatedAt) AS Year, ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt) AS ${filter}, COUNT(*) AS holdCount FROM oppurtunities WHERE status = 'Hold' GROUP BY YEAR(updatedAt), ${
          filter === 'WEEK' ? 'WEEK' : filter === 'MONTH' ? 'MONTH' : 'QUARTER'
        }(updatedAt)) AS holdCount
      ON
        oppCount.Year = holdCount.Year AND oppCount.${filter} = holdCount.${filter}
      ORDER BY
        oppCount.Year DESC, oppCount.${filter} DESC;
    `;
    }

    const opportunityWonQueryCount = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(opportunityWonQueryCount);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const totalUserCount = async (req, res) => {
  try {
    const summary = await User.findAndCountAll({
      attributes: [
        [User.sequelize.fn('COUNT', User.sequelize.col('*')), 'total_users'],
        [
          User.sequelize.fn(
            'SUM',
            User.sequelize.literal(`CASE WHEN user_type = 'Leader' THEN ${1} ELSE ${0} END`)
          ),
          'leader_count',
        ],
        [
          User.sequelize.fn(
            'SUM',
            User.sequelize.literal(`CASE WHEN user_type = 'Reader' THEN ${1} ELSE ${0} END`)
          ),
          'reader_count',
        ],
        [
          User.sequelize.fn(
            'SUM',
            User.sequelize.literal(`CASE WHEN user_type = 'Admin' THEN ${1} ELSE ${0} END`)
          ),
          'admin_count',
        ],
      ],
    });

    res.json(summary.rows[0]);
  } catch (err) {
    console.error('Error fetching user summary:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMissionCardCount = async (req, res) => {
  try {
    const totalMissionCards = await MissionCard.count();

    const missionCardStatusCount = await MissionCard.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', 'status'), 'count']],
      group: ['status'],
    });

    res.status(200).json({ totalMissionCards, missionCardStatusCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMissionLeaderCount = async (req, res) => {
  try {
    // Total number of mission leaders
    const totalMissionLeaders = await MissionCard.count({
      distinct: true,
      col: 'mission_card_leader',
      where: {
        missionCardLeader: {
          [Op.ne]: null, // Exclude null values
        },
      },
    });

    // Top three mission leaders with the most number of missions
    const topMissionLeaders = await MissionCard.findAll({
      attributes: [
        'mission_card_leader',
        [sequelize.fn('COUNT', sequelize.col('*')), 'total_missions'],
      ],
      where: {
        missionCardLeader: {
          [Op.ne]: null, // Exclude null values
        },
      },
      group: ['mission_card_leader'],
      order: [[sequelize.literal('total_missions'), 'DESC']],
      limit: 3,
      include: [
        {
          model: User,
          as: 'assignedMissionCards',
          attributes: ['username'],
        },
      ],
    });

    res.status(200).json({ totalMissionLeaders, topMissionLeaders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const totalProjectCount = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    res.json({ total_projects: totalProjects });
  } catch (error) {
    console.error('Error fetching total number of projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLatestOpportunities = async (req, res) => {
  try {
    const query = `SELECT *
    FROM oppurtunities
    WHERE NextContactDate >= CURDATE()
    ORDER BY NextContactDate ASC 
    LIMIT 5;  `;

    const latestOpportunities = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json(latestOpportunities);
  } catch (error) {
    console.error('Error fetching latest Missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExpensesAndInvoicesData = async (req, res) => {
  try {
    const { granularity, cluster, region } = req.query;
    let groupBy;
    let PoIds = [];

    if (granularity === 'yearly' || granularity === 'quarterly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy = ['year'];
    }
    if (granularity === 'quarterly') {
      groupBy.push('fiscalQuarter');
    } else if (granularity === 'yearly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy.push('month');
    }

    const whereClause = {
      ...(cluster ? { cluster: cluster } : {}),
      ...(region ? { region: region } : {}),
    };

    const fiscalYearPurchase = `CASE 
    WHEN MONTH(poDate) >= 4 THEN YEAR(poDate) + 1
    ELSE YEAR(poDate)
  END`;
    const fiscalQuarterPurchase = `CASE
    WHEN MONTH(poDate) BETWEEN 4 AND 6 THEN 1
    WHEN MONTH(poDate) BETWEEN 7 AND 9 THEN 2
    WHEN MONTH(poDate) BETWEEN 10 AND 12 THEN 3
    ELSE 4
  END`;
    const fiscalMonthPurchase = `CASE
    WHEN MONTH(poDate) >= 4 THEN CONCAT(YEAR(poDate) + 1, '-', MONTH(poDate))
    ELSE CONCAT(YEAR(poDate), '-', MONTH(poDate))
  END`;

    const fiscalYearInvoice = `CASE 
    WHEN MONTH(invoice_date) >= 4 THEN YEAR(invoice_date) + 1
    ELSE YEAR(invoice_date)
  END`;
    const fiscalQuarterInvoice = `CASE
    WHEN MONTH(invoice_date) BETWEEN 4 AND 6 THEN 1
    WHEN MONTH(invoice_date) BETWEEN 7 AND 9 THEN 2
    WHEN MONTH(invoice_date) BETWEEN 10 AND 12 THEN 3
    ELSE 4
  END`;
    const fiscalMonthInvoice = `CASE
    WHEN MONTH(invoice_date) >= 4 THEN CONCAT(YEAR(invoice_date) + 1, '-', MONTH(invoice_date))
    ELSE CONCAT(YEAR(invoice_date), '-', MONTH(invoice_date))
  END`;

    // Get expenses data grouped by year and month or quarter
    const purchaseData = await PurchaseOrder.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('poDate')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterPurchase), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('poDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('poAmount')), 'totalAmount'],
      ],
      group: groupBy, // Filter out null values
      where: whereClause,
      order: [[sequelize.fn('MAX', sequelize.col('poDate')), 'DESC']],
      limit: 12,
    });

    if (cluster && !region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { cluster: cluster },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else if (!cluster && region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { region: region },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else if (cluster && region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { cluster: cluster, region: region },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else {
      const purchaseOrderData = await PurchaseOrder.findAll();
      PoIds = purchaseOrderData.map((po) => po.id);
    }

    // Get invoices data grouped by year and month or quarter
    const invoicesData = await InvoiceModel.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterInvoice), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'totalAmount'],
      ],
      group: groupBy, // Filter out null values
      where: {
        poId: {
          [Op.in]: PoIds,
        },
      },
      order: [[sequelize.fn('MAX', sequelize.col('invoice_date')), 'DESC']],
      limit: 12,
    });

    // Merge expenses and invoices data
    const chartData = mergeData(purchaseData, invoicesData, granularity);

    // Sort the data by year and month or quarter in ascending order
    chartData.sort((a, b) => {
      if (granularity === 'yearly') {
        // Sort only by year
        // console.log(a.month.split("-")[0], b.month.split("-")[0]);
        const aYear = a.month.split('-')[0];
        const bYear = b.month.split('-')[0];

        if (Number(aYear) < Number(bYear)) {
          return -1;
        }
        if (Number(aYear) > Number(bYear)) {
          return 1;
        }

        return 0;
      } else {
        // For other granularities, sort by year and then by month or quarter
        if (granularity === 'quarterly') {
          const [aYear, aQuarter] = a.month.split('-').map(Number);
          const [bYear, bQuarter] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }
          // If years are equal, compare quarters
          if (aQuarter < bQuarter) {
            return -1;
          }
          if (aQuarter > bQuarter) {
            return 1;
          }
          return 0;
        } else {
          const [aYear, aMonth] = a.month.split('-').map(Number);
          const [bYear, bMonth] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }
          // If years are equal, compare months
          if (aMonth < bMonth) {
            return -1;
          }
          if (aMonth > bMonth) {
            return 1;
          }
          return 0;
        }
      }
    });

    res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getForecastAndRevenueData = async (req, res) => {
  try {
    const { granularity, cluster, region } = req.query;
    let groupBy;
    let RevenueIds = [];

    if (granularity === 'yearly' || granularity === 'quarterly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy = ['year'];
    }
    if (granularity === 'quarterly') {
      groupBy.push('fiscalQuarter');
    } else if (granularity === 'yearly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy.push('month');
    }
    const whereClause = {
      ...(cluster ? { cluster: cluster } : {}),
      ...(region ? { region: region } : {}),
    };

    const fiscalYearRevenue = `CASE 
    WHEN MONTH(invoice_date) >= 4 THEN YEAR(invoice_date) + 1
    ELSE YEAR(invoice_date)
  END`;
    const fiscalQuarterRevenue = `CASE
    WHEN MONTH(invoice_date) BETWEEN 4 AND 6 THEN 1
    WHEN MONTH(invoice_date) BETWEEN 7 AND 9 THEN 2
    WHEN MONTH(invoice_date) BETWEEN 10 AND 12 THEN 3
    ELSE 4
  END`;
    // const fiscalMonthRevenue = `CASE
    //   WHEN MONTH(invoice_date) >= 4 THEN CONCAT(YEAR(invoice_date) + 1, '-', MONTH(invoice_date))
    //   ELSE CONCAT(YEAR(invoice_date), '-', MONTH(invoice_date))
    // END`;

    const fiscalYearForecast = `CASE 
    WHEN MONTH(forcastDate) >= 4 THEN YEAR(forcastDate) + 1
    ELSE YEAR(forcastDate)
  END`;
    const fiscalQuarterForecast = `CASE
    WHEN MONTH(forcastDate) BETWEEN 4 AND 6 THEN 1
    WHEN MONTH(forcastDate) BETWEEN 7 AND 9 THEN 2
    WHEN MONTH(forcastDate) BETWEEN 10 AND 12 THEN 3
    ELSE 4
  END`;
    // const fiscalMonthForecast = `CASE
    //   WHEN MONTH(forcastDate) >= 4 THEN CONCAT(YEAR(forcastDate) + 1, '-', MONTH(forcastDate))
    //   ELSE CONCAT(YEAR(forcastDate), '-', MONTH(forcastDate))
    // END`;

    if (cluster && !region) {
      const revenue = await RevenueModel.findAll({
        where: { cluster: cluster },
      });
      RevenueIds = revenue.map((revenue) => revenue.id);
    } else if (!cluster && region) {
      const revenue = await RevenueModel.findAll({
        where: { region: region },
      });
      RevenueIds = revenue.map((revenue) => revenue.id);
    } else if (cluster && region) {
      const revenue = await RevenueModel.findAll({
        where: { cluster: cluster, region: region },
      });
      RevenueIds = revenue.map((revenue) => revenue.id);
    } else {
      const revenue = await RevenueModel.findAll();
      RevenueIds = revenue.map((revenue) => revenue.id);
    }

    const revenueData = await revenueInvoiceModel.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearRevenue), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterRevenue), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearRevenue), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('planned_revenue')), 'plannedRevenue'],
        [sequelize.fn('SUM', sequelize.col('actual_revenue')), 'actualRevenue'],
        [sequelize.fn('SUM', sequelize.col('forecast_revenue')), 'forecastRevenue'],
      ],
      group: groupBy, // Filter out null values
      where: {
        revenueId: {
          [Op.in]: RevenueIds,
        },
      },
      order: [[sequelize.fn('MAX', sequelize.col('invoice_date')), 'DESC']],
      limit: 12,
    });

    // [sequelize.fn("YEAR", sequelize.col("forcastDate")), "year"],

    // Get invoices data grouped by year and month or quarter
    const forecastData = await ForecastModel.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearForecast), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('forcastDate')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterForecast), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearForecast), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('forcastDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('deliveryForcast')), 'deliveryForecast'],
        [sequelize.fn('SUM', sequelize.col('salesForcast')), 'salesForecast'],
        [sequelize.fn('SUM', sequelize.col('revenueForcast')), 'revenueForecast'],
      ],
      group: groupBy,
      where: whereClause,
      order: [[sequelize.fn('MAX', sequelize.col('forcastDate')), 'DESC']],
      limit: 12,
    });

    const chartData = mergeForecastData(revenueData, forecastData, granularity);

    // Sort the data by year and month or quarter in ascending order
    chartData.sort((a, b) => {
      if (granularity === 'yearly') {
        const aYear = a.month.split('-')[0];
        const bYear = b.month.split('-')[0];

        if (Number(aYear) < Number(bYear)) {
          return -1;
        }
        if (Number(aYear) > Number(bYear)) {
          return 1;
        }

        return 0;
      } else {
        if (granularity === 'quarterly') {
          // console.log(a);
          // console.log(b);
          const [aYear, aQuarter] = a.month.split('-').map(Number);
          const [bYear, bQuarter] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }
          if (aQuarter < bQuarter) {
            return -1;
          }
          if (aQuarter > bQuarter) {
            return 1;
          }
          return 0;
        } else {
          const [aYear, aMonth] = a.month.split('-').map(Number);
          const [bYear, bMonth] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }

          if (aMonth < bMonth) {
            return -1;
          }
          if (aMonth > bMonth) {
            return 1;
          }
          return 0;
        }
      }
    });

    res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// controller not in use
const getExpenseAmount = async (req, res) => {
  try {
    const currentDate = new Date();

    // Calculate the date range for the previous month
    const previousMonthFirstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const previousMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const [result] = await sequelize.query(
      'SELECT SUM(expenseAmount) AS totalExpenseAmount FROM expenses;',
      { type: QueryTypes.SELECT }
    );

    const [previousMonthResult] = await sequelize.query(
      `SELECT 
            SUM(expenseAmount) AS totalExpenseAmountLastMonth   
         FROM 
            expenses
         WHERE 
            expenseDate BETWEEN :previousMonthFirstDay AND :previousMonthLastDay`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          previousMonthFirstDay,
          previousMonthLastDay,
        },
      }
    );

    const { totalExpenseAmount } = result;
    const { totalExpenseAmountLastMonth } = previousMonthResult;

    res.json({
      totalExpenseAmount,
      totalExpenseAmountLastMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLatestPurchaseOrders = async (req, res) => {
  try {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30); // Get orders that are about to come within next 30 days

    // Retrieve the purchase orders whose dates are nearer and about to come
    const latestPurchaseOrders = await sequelize.query(
      `SELECT 
          poPrice,
          poAmount,
          poDescription,
          poDate
       FROM 
          purchaseorders
       WHERE 
          poDate BETWEEN :currentDate AND :futureDate
       ORDER BY 
          poDate
       `,
      {
        type: QueryTypes.SELECT,
        replacements: { currentDate, futureDate },
      }
    );

    res.json(latestPurchaseOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controller for purchase order pie chart
const getTotalPurchase = async (req, res) => {
  try {
    const { query } = req.query;
    // Get total expense amount
    const totalPurchase = await PurchaseOrder.sum('poAmount');

    if (query === 'cluster') {
      const purchaseByCategory = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.literal(`cluster`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(poAmount, 0)')), 'totalAmount'],
        ],
        group: ['cluster'],
      });

      const response = {
        totalPurchase: totalPurchase || 0,
        purchaseByCategory: purchaseByCategory || [],
      };

      res.status(200).json(response);
    } else {
      const purchaseByCategory = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.literal(`region`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(poAmount, 0)')), 'totalAmount'],
        ],
        group: ['region'],
      });

      const response = {
        totalPurchase: totalPurchase || 0,
        purchaseByCategory: purchaseByCategory || [],
      };

      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error retrieving total expense amount and by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// revenue Pie chart controller
const getTotalRevenue = async (req, res) => {
  try {
    const { query } = req.query;
    // Group the revenue data by cluster or region and calculate the sum of planned, actual, and forecast revenue
    if (query === 'cluster') {
      const revenueByCluster = await RevenueModel.findAll({
        attributes: [
          [sequelize.literal(`cluster`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(actualRevenue, 0)')), 'totalAmount'],
        ],
        group: ['cluster'],
      });

      res.json(revenueByCluster);
    } else {
      const revenueByRegion = await RevenueModel.findAll({
        attributes: [
          [sequelize.literal(`region`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(actualRevenue, 0)')), 'totalAmount'],
        ],
        group: ['region'],
      });

      res.json(revenueByRegion);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// mission leader PO Controller
const getPurchaseGraphAmounts = async (req, res) => {
  try {
    // Fetch the latest 7 purchase orders
    const latestMissionCards = await MissionCard.findAll({
      limit: 7,
    });

    const missionIds = latestMissionCards.map((mission) => mission.id);

    // Retrieve all purchase orders associated with the mission cards
    const purchaseOrders = await PurchaseOrder.findAll({
      where: {
        poMissionId: {
          [Op.in]: missionIds,
        },
      },
    });

    // Calculate the total purchase amount for each mission leader
    const purchaseAmountsByLeader = {};

    latestMissionCards.forEach((mission) => {
      const missionLeader = mission.missionCardLeader;

      const purchaseTotal = purchaseOrders.reduce((total, purchase) => {
        if (purchase.poMissionId === mission.id) {
          return total + parseFloat(purchase.poAmount || 0);
        }
        return total;
      }, 0);

      if (purchaseAmountsByLeader[missionLeader]) {
        purchaseAmountsByLeader[missionLeader] += purchaseTotal;
      } else {
        purchaseAmountsByLeader[missionLeader] = purchaseTotal;
      }
    });

    // Transform the result to the desired format
    const result = Object.entries(purchaseAmountsByLeader).map(
      ([missionLeader, purchaseTotal]) => ({
        missionLeader,
        purchaseTotal,
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controller for purchase order graph

const getPurchaseStats = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Get the start date for 12 months ago
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const purchaseAmount = await PurchaseOrder.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('poAmount')), 'totalPurchaseAmount']],
    });

    // Query to get invoice stats for the last 12 months
    let purchaseStats = await PurchaseOrder.findAll({
      attributes: [
        [
          sequelize.fn(
            'CONCAT',
            sequelize.fn('YEAR', sequelize.col('poDate')),
            '-',
            sequelize.fn('MONTH', sequelize.col('poDate'))
          ),
          'monthYear',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'purchaseCount'],
      ],
      where: {
        poDate: {
          [Op.between]: [startDate, currentDate],
        },
      },
      group: [`monthYear`],
    });

    // Convert the raw purchaseStats data to a more usable format and sort by date
    purchaseStats = purchaseStats.map((stat) => {
      const [year, month] = stat.get('monthYear').split('-');
      return {
        monthYear: stat.get('monthYear'),
        purchaseCount: stat.get('purchaseCount'),
        date: new Date(year, month - 1), // Create a Date object for sorting
      };
    });

    // Sort the purchaseStats by the date
    purchaseStats.sort((a, b) => a.date - b.date);

    // Remove the date property before sending the response
    purchaseStats = purchaseStats.map((stat) => {
      return {
        monthYear: stat.monthYear,
        purchaseCount: stat.purchaseCount,
      };
    });

    res.status(200).json({ purchaseStats, purchaseAmount });
  } catch (error) {
    console.error('Error fetching Purchase stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controller not in use
const getLatestExpenses = async (req, res) => {
  try {
    // Assuming your ExpenseModel has a createdAt field to indicate when the expense was created
    const latestExpenses = await Expense.findAll({
      order: [['expenseDate', 'DESC']], // Order by createdAt field in descending order
    });

    res.status(200).json(latestExpenses);
  } catch (error) {
    console.error('Error fetching latest expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controller not in use
const getLatestPoAndInvoiceData = async (req, res) => {
  try {
    // Get the latest 7 Purchase Orders
    const latestPurchaseOrders = await PurchaseOrder.findAll({
      limit: 7,
      order: [['poDate', 'DESC']],
    });

    // Calculate total PO amount
    const totalPOAmount = latestPurchaseOrders.reduce((acc, po) => {
      const currentPOAmount = parseFloat(po.poAmount) || 0;
      // console.log("Current PO Amount:", currentPOAmount);
      return acc + currentPOAmount;
    }, 0);

    // console.log("Total PO Amount:", totalPOAmount);

    // Calculate total PO price
    const totalPOPrice = latestPurchaseOrders.reduce((acc, po) => {
      const currentPOPrice = parseFloat(po.poPrice) || 0;
      // console.log("Current PO Price:", currentPOPrice);
      return acc + currentPOPrice;
    }, 0);

    // console.log("Total PO Price:", totalPOPrice);

    // Get the latest 7 Expenses
    const latestExpenses = await Expense.findAll({
      limit: 7,
      order: [['expenseDate', 'DESC']],
    });

    // Calculate total expense
    const totalExpense = latestExpenses.reduce(
      (acc, expense) => acc + parseFloat(expense.expenseAmount || 0),
      0
    );

    res.status(200).json({
      totalPOAmount,
      totalPOPrice,
      totalExpense,
      latestPurchaseOrders,
    });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLatestForecastsByDate = async (req, res) => {
  try {
    const forecastList = await ForecastModel.findAll({
      limit: 5,
      order: [['forcastDate', 'DESC']],
    });
    res.json(forecastList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/***********************************/

//controller not in use as of now
const getForecastSum = async (req, res) => {
  try {
    const today = new Date();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    const OverallSum = await calculateOverallSum();
    const lastQuarterSum = await calculateQuarterSum(today, lastQuarter);

    res.json({ OverallSum, lastQuarterSum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//controller not in use as of now
const getPurchaseAmount = async (req, res) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const currentQuarter = getQuarter(currentDate);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;

    switch (lastQuarter) {
      case 1:
        startMonth = 1;
        endMonth = 3;
        break;
      case 2:
        startMonth = 4;
        endMonth = 6;
        break;
      case 3:
        startMonth = 7;
        endMonth = 9;
        break;
      case 4:
        startMonth = 10;
        endMonth = 12;
        break;
      default:
        startMonth = 1;
        endMonth = 3;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const [result] = await sequelize.query(
      'SELECT SUM(poAmount) AS totalPoAmount FROM purchaseorders;',
      { type: QueryTypes.SELECT }
    );

    const [previousQuarterResult] = await sequelize.query(
      `SELECT 
            SUM(poAmount) AS totalPoAmountLastQuarter 
         FROM 
            purchaseorders
         WHERE 
            poDate BETWEEN :startDate AND :endDate`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          startDate,
          endDate,
        },
      }
    );

    const [statusCounts] = await sequelize.query(
      `SELECT 
            po_status, 
            SUM(poAmount) AS count 
         FROM 
            purchaseorders
         GROUP BY 
         po_status`
    );

    const { totalPoAmount } = result;
    const { totalPoAmountLastQuarter } = previousQuarterResult;

    res.json({
      totalPoAmount,
      totalPoAmountLastQuarter,
      statusCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//controller not in use as of now
const getInvoiceSum = async (req, res) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const currentQuarter = getQuarter(currentDate);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;

    switch (lastQuarter) {
      case 1:
        startMonth = 1;
        endMonth = 3;
        break;
      case 2:
        startMonth = 4;
        endMonth = 6;
        break;
      case 3:
        startMonth = 7;
        endMonth = 9;
        break;
      case 4:
        startMonth = 10;
        endMonth = 12;
        break;
      default:
        startMonth = 1;
        endMonth = 3;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const [result] = await sequelize.query(
      'SELECT SUM(invoice_amount) AS totalInvoiceAmount FROM invoices;',
      { type: QueryTypes.SELECT }
    );

    const [previousQuarterResult] = await sequelize.query(
      `SELECT 
            SUM(invoice_amount) AS totalInvoiceAmountLastQuarter 
         FROM 
            invoices
         WHERE 
            invoice_date BETWEEN :startDate AND :endDate`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          startDate,
          endDate,
        },
      }
    );

    const [invoiceCount] = await sequelize.query(
      `SELECT 
            COUNT(*) AS count 
         FROM 
            invoices;`
    );

    const { totalInvoiceAmount } = result;
    const { totalInvoiceAmountLastQuarter } = previousQuarterResult;

    res.json({
      totalInvoiceAmount,
      totalInvoiceAmountLastQuarter,
      invoiceCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//controller not in use as of now
const getRevenueSum = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 1;
        endMonth = 3;
        break;
      case 2:
        startMonth = 4;
        endMonth = 6;
        break;
      case 3:
        startMonth = 7;
        endMonth = 9;
        break;
      case 4:
        startMonth = 10;
        endMonth = 12;
        break;
      default:
        startMonth = 1;
        endMonth = 3;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const QuarterSum = await RevenueModel.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('plannedRevenue')), 'totalPlannedRevenue'],
        [sequelize.fn('SUM', sequelize.col('actualRevenue')), 'totalActualRevenue'],
        [sequelize.fn('SUM', sequelize.col('forecastRevenue')), 'totalForecastRevenue'],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const OverallSum = await RevenueModel.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('plannedRevenue')), 'totalPlannedRevenue'],
        [sequelize.fn('SUM', sequelize.col('actualRevenue')), 'totalActualRevenue'],
        [sequelize.fn('SUM', sequelize.col('forecastRevenue')), 'totalForecastRevenue'],
      ],
    });

    res.status(200).json({ OverallSum, QuarterSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/***********************************/

// planned revenue card controller
const getPlannedData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 4;
        endMonth = 6;
        break;
      case 2:
        startMonth = 7;
        endMonth = 9;
        break;
      case 3:
        startMonth = 10;
        endMonth = 12;
        break;
      case 4:
        startMonth = 1;
        endMonth = 3;
        break;
      default:
        startMonth = 4;
        endMonth = 6;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const PlannedSumThisQuarter = await revenueInvoiceModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('planned_revenue')), 'totalPlannedRevenue']],
      where: {
        invoice_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const OverallSum = await revenueInvoiceModel.findAll({
      attributes: [
        [sequelize.col('invoiceRevenue.cluster'), 'cluster'],
        [sequelize.fn('SUM', sequelize.col('planned_revenue')), 'totalPlannedRevenue'],
      ],
      include: [
        {
          model: RevenueModel,
          as: 'invoiceRevenue',
          attributes: [], // Don't include RevenueModel attributes in the result
        },
      ],
      where: {
        invoice_date: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['invoiceRevenue.cluster'],
    });

    res.status(200).json({ PlannedSumThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// actual value card controller
const getActualData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 4;
        endMonth = 6;
        break;
      case 2:
        startMonth = 7;
        endMonth = 9;
        break;
      case 3:
        startMonth = 10;
        endMonth = 12;
        break;
      case 4:
        startMonth = 1;
        endMonth = 3;
        break;
      default:
        startMonth = 4;
        endMonth = 6;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-31`);

    const ActualSumThisQuarter = await revenueInvoiceModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('actual_revenue')), 'totalActualRevenue']],
      where: {
        invoice_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const OverallSum = await revenueInvoiceModel.findAll({
      attributes: [
        [sequelize.col('invoiceRevenue.cluster'), 'cluster'],
        [sequelize.fn('SUM', sequelize.col('actual_revenue')), 'totalActualRevenue'],
      ],
      include: [
        {
          model: RevenueModel,
          as: 'invoiceRevenue',
          attributes: [], // Don't include RevenueModel attributes in the result
        },
      ],
      where: {
        invoice_date: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['invoiceRevenue.cluster'],
    });

    res.status(200).json({ ActualSumThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// delivery value card controller
const getDeliveryData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 4;
        endMonth = 6;
        break;
      case 2:
        startMonth = 7;
        endMonth = 9;
        break;
      case 3:
        startMonth = 10;
        endMonth = 12;
        break;
      case 4:
        startMonth = 1;
        endMonth = 3;
        break;
      default:
        startMonth = 4;
        endMonth = 6;
        break;
    }
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0); // Last day of the end month

    const DeliverySumThisQuarter = await ForecastModel.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('forcastDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('deliveryForcast')), 'totalDeliveryForcast'],
      ],
      where: {
        forcastDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['month'],
      order: [[sequelize.fn('MONTH', sequelize.col('forcastDate')), 'ASC']],
    });

    const OverallSum = await ForecastModel.findAll({
      attributes: [
        [sequelize.literal('cluster'), 'cluster'],
        [sequelize.fn('SUM', sequelize.col('deliveryForcast')), 'totalDeliveryForcast'],
      ],
      where: {
        forcastDate: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['cluster'],
    });

    res.status(200).json({ DeliverySumThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// sales value card controller
const getSalesData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 4;
        endMonth = 6;
        break;
      case 2:
        startMonth = 7;
        endMonth = 9;
        break;
      case 3:
        startMonth = 10;
        endMonth = 12;
        break;
      case 4:
        startMonth = 1;
        endMonth = 3;
        break;
      default:
        startMonth = 4;
        endMonth = 6;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const SalesSumThisQuarter = await ForecastModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('salesForcast')), 'totalSalesForcast']],
      where: {
        forcastDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const OverallSum = await ForecastModel.findAll({
      attributes: [
        [sequelize.literal('cluster'), 'cluster'],
        [sequelize.fn('SUM', sequelize.col('salesForcast')), 'totalSalesForcast'],
      ],
      where: {
        forcastDate: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['cluster'],
    });

    res.status(200).json({ SalesSumThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// forecast value card controller
const getforecastData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    let startMonth, endMonth;
    switch (lastQuarter) {
      case 1:
        startMonth = 4;
        endMonth = 6;
        break;
      case 2:
        startMonth = 7;
        endMonth = 9;
        break;
      case 3:
        startMonth = 10;
        endMonth = 12;
        break;
      case 4:
        startMonth = 1;
        endMonth = 3;
        break;
      default:
        startMonth = 4;
        endMonth = 6;
        break;
    }

    const startDate = new Date(`${year}-${startMonth}-01`);
    const endDate = new Date(`${year}-${endMonth}-28`);

    const startOfMonth = new Date(year, currentMonth - 1, 1);
    const endOfMonth = new Date(year, currentMonth, 0);

    const ForecastSumThisQuarter = await ForecastModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('revenueForcast')), 'totalRevenueForecast']],
      where: {
        forcastDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const OverallSum = await ForecastModel.findAll({
      attributes: [
        'cluster',
        [sequelize.fn('SUM', sequelize.col('revenueForcast')), 'totalRevenueForecast'],
        [sequelize.literal('updatedAt'), 'updatedAt'],
      ],
      where: {
        forcastDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      group: ['cluster', 'updatedAt'],
    });

    const ForecastSumThisMonth = await ForecastModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('revenueForcast')), 'totalRevenueForecast']],
      where: {
        forcastDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    res.status(200).json({ ForecastSumThisQuarter, OverallSum, ForecastSumThisMonth });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCummulativeGraphData = async (req, res) => {
  try {
    const { granularity, cluster, region } = req.query;
    let groupBy;
    let PoIds = [];

    if (granularity === 'yearly' || granularity === 'quarterly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy = ['year'];
    }
    if (granularity === 'quarterly') {
      groupBy.push('fiscalQuarter');
    } else if (granularity === 'yearly') {
      groupBy = ['fiscalYear'];
    } else {
      groupBy.push('month');
    }

    const whereClause = {
      ...(cluster ? { cluster: cluster } : {}),
      ...(region ? { region: region } : {}),
    };

    const fiscalYearPurchase = `CASE
      WHEN MONTH(poDate) >= 4 THEN YEAR(poDate) + 1
      ELSE YEAR(poDate)
    END`;
    const fiscalQuarterPurchase = `CASE
      WHEN MONTH(poDate) BETWEEN 4 AND 6 THEN 1
      WHEN MONTH(poDate) BETWEEN 7 AND 9 THEN 2
      WHEN MONTH(poDate) BETWEEN 10 AND 12 THEN 3
      ELSE 4
    END`;
    const fiscalMonthPurchase = `CASE
      WHEN MONTH(poDate) >= 4 THEN CONCAT(YEAR(poDate) + 1, '-', LPAD(MONTH(poDate), 2, '0'))
      ELSE CONCAT(YEAR(poDate), '-', LPAD(MONTH(poDate), 2, '0'))
    END`;

    const fiscalYearInvoice = `CASE
      WHEN MONTH(invoice_date) >= 4 THEN YEAR(invoice_date) + 1
      ELSE YEAR(invoice_date)
    END`;
    const fiscalQuarterInvoice = `CASE
      WHEN MONTH(invoice_date) BETWEEN 4 AND 6 THEN 1
      WHEN MONTH(invoice_date) BETWEEN 7 AND 9 THEN 2
      WHEN MONTH(invoice_date) BETWEEN 10 AND 12 THEN 3
      ELSE 4
    END`;
    const fiscalMonthInvoice = `CASE
      WHEN MONTH(invoice_date) >= 4 THEN CONCAT(YEAR(invoice_date) + 1, '-', LPAD(MONTH(invoice_date), 2, '0'))
      ELSE CONCAT(YEAR(invoice_date), '-', LPAD(MONTH(invoice_date), 2, '0'))
    END`;

    // Get expenses data grouped by year and month or quarter
    const purchaseData = await PurchaseOrder.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('poDate')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterPurchase), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('poDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('poAmount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'Count'],
      ],
      group: groupBy, // Filter out null values
      where: whereClause,
      order: [[sequelize.fn('MAX', sequelize.col('poDate')), 'ASC']],
      limit: 12,
    });

    if (cluster && !region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { cluster: cluster },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else if (!cluster && region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { region: region },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else if (cluster && region) {
      const purchaseOrderData = await PurchaseOrder.findAll({
        where: { cluster: cluster, region: region },
      });
      PoIds = purchaseOrderData.map((po) => po.id);
    } else {
      const purchaseOrderData = await PurchaseOrder.findAll();
      PoIds = purchaseOrderData.map((po) => po.id);
    }

    // Get invoices data grouped by year and month or quarter
    const invoicesData = await InvoiceModel.findAll({
      attributes: [
        granularity === 'yearly' || granularity === 'quarterly'
          ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        granularity === 'quarterly'
          ? [sequelize.literal(fiscalQuarterInvoice), 'fiscalQuarter']
          : granularity === 'yearly'
            ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'totalAmount'],
      ],
      group: groupBy, // Filter out null values
      where: {
        poId: {
          [Op.in]: PoIds,
        },
      },
      order: [[sequelize.fn('MAX', sequelize.col('invoice_date')), 'ASC']],
      limit: 12,
    });

    // Merge expenses and invoices data
    const chartData = mergeCummulativeData(purchaseData, invoicesData, granularity);

    // Sort the data by year and month or quarter in ascending order
    chartData.sort((a, b) => {
      if (granularity === 'yearly') {
        // Sort only by year
        // console.log(a.month.split("-")[0], b.month.split("-")[0]);
        const aYear = a.month.split('-')[0];
        const bYear = b.month.split('-')[0];

        if (Number(aYear) < Number(bYear)) {
          return -1;
        }
        if (Number(aYear) > Number(bYear)) {
          return 1;
        }

        return 0;
      } else {
        // For other granularities, sort by year and then by month or quarter
        if (granularity === 'quarterly') {
          const [aYear, aQuarter] = a.month.split('-').map(Number);
          const [bYear, bQuarter] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }
          // If years are equal, compare quarters
          if (aQuarter < bQuarter) {
            return -1;
          }
          if (aQuarter > bQuarter) {
            return 1;
          }
          return 0;
        } else {
          const [aYear, aMonth] = a.month.split('-').map(Number);
          const [bYear, bMonth] = b.month.split('-').map(Number);

          if (aYear < bYear) {
            return -1;
          }
          if (aYear > bYear) {
            return 1;
          }
          // If years are equal, compare months
          if (aMonth < bMonth) {
            return -1;
          }
          if (aMonth > bMonth) {
            return 1;
          }
          return 0;
        }
      }
    });

    let cumulativePurchases = 0;
    let cumulativeInvoices = 0;
    chartData.forEach((data) => {
      cumulativePurchases += data.purchases;
      cumulativeInvoices += data.invoices;
      data.cumulativePurchases = cumulativePurchases;
      data.cumulativeInvoices = cumulativeInvoices;
    });

    res.status(200).json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getPoExcelData = async (req, res) => {
  try {
    // Get unique months and years from the invoices table, and sort them
    const invoicesData = await InvoiceModel.findAll({
      attributes: [
        [fn('MONTH', col('invoice_date')), 'month'],
        [fn('YEAR', col('invoice_date')), 'year'],
      ],
      group: ['month', 'year'],
      raw: true,
    });

    // Sort the invoicesData by year and month
    const sortedInvoicesData = invoicesData.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      } else {
        return a.year - b.year;
      }
    });

    // Create dynamic columns for each month/year combination in sorted order
    const dynamicColumns = sortedInvoicesData
      .map((data) => {
        const month = data.month;
        const year = data.year;
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        return [
          // Invoice Amount Column
          literal(
            `SUM(CASE WHEN MONTH(invoice_date) = ${month} AND YEAR(invoice_date) = ${year} THEN invoice_amount ELSE 0 END) AS '${monthName} ${year} Invoice'`
          ),
          // Forecast Amount Column
          literal(
            `SUM(CASE WHEN MONTH(invoice_date) = ${month} AND YEAR(invoice_date) = ${year} THEN forecast_amount ELSE 0 END) AS '${monthName} ${year} Forecast'`
          ),
        ];
      })
      .flat();

    // Query to fetch purchase orders and their invoices data
    const purchaseOrders = await PurchaseOrder.findAll({
      attributes: ['*', ...dynamicColumns],
      include: [
        {
          model: MissionCard,
          attributes: ['airbusId'],
          as: 'projectPo',
        },
        {
          model: InvoiceModel,
          attributes: [],
          as: 'invoicePo',
        },
      ],
      group: ['id'],
      raw: true, // Raw query result to handle dynamic columns
    });

    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//helper function
const getQuarter = (date) => {
  const month = date.getMonth() + 1;
  return Math.ceil(month / 3);
};

const calculateQuarterSum = async (today, quarter) => {
  const year = today.getFullYear();

  let startMonth, endMonth;
  switch (quarter) {
    case 1:
      startMonth = 1;
      endMonth = 3;
      break;
    case 2:
      startMonth = 4;
      endMonth = 6;
      break;
    case 3:
      startMonth = 7;
      endMonth = 9;
      break;
    case 4:
      startMonth = 10;
      endMonth = 12;
      break;
    default:
      startMonth = 1;
      endMonth = 3;
      break;
  }

  const startDate = new Date(`${year}-${startMonth}-01`);
  const endDate = new Date(`${year}-${endMonth}-28`);

  const quarterSum = await ForecastModel.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('deliveryForcast')), 'totalDeliveryForcast'],
      [sequelize.fn('SUM', sequelize.col('salesForcast')), 'totalSalesForcast'],
      [sequelize.fn('SUM', sequelize.col('revenueForcast')), 'totalRevenueForcast'],
    ],
    where: {
      forcastDate: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  return quarterSum;
};

const calculateOverallSum = async () => {
  const overallSum = await ForecastModel.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('deliveryForcast')), 'totalDeliveryForcast'],
      [sequelize.fn('SUM', sequelize.col('salesForcast')), 'totalSalesForcast'],
      [sequelize.fn('SUM', sequelize.col('revenueForcast')), 'totalRevenueForcast'],
    ],
  });

  return overallSum;
};

const mergeData = (purchaseData, invoicesData, granularity) => {
  const chartData = [];

  // Create a map to store expenses and invoices data
  const dataMap = new Map();

  // Populate dataMap with expenses data
  for (const purchase of purchaseData) {
    const monthKey =
      granularity === 'yearly'
        ? `${purchase.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${purchase.dataValues.fiscalYear}-${purchase.dataValues.fiscalQuarter}`
          : `${purchase.dataValues.year}-${purchase.dataValues.month}`;
    dataMap.set(monthKey, {
      month: monthKey,
      purchases: purchase.dataValues.totalAmount || 0,
      invoices: 0,
    });
  }

  // Update dataMap with invoices data
  for (const invoice of invoicesData) {
    const monthKey =
      granularity === 'yearly'
        ? `${invoice.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${invoice.dataValues.fiscalYear}-${invoice.dataValues.fiscalQuarter}`
          : `${invoice.dataValues.year}-${invoice.dataValues.month}`;
    if (dataMap.has(monthKey)) {
      const existingData = dataMap.get(monthKey);
      existingData.invoices = invoice.dataValues.totalAmount || 0;
      dataMap.set(monthKey, existingData);
    } else {
      dataMap.set(monthKey, {
        month: monthKey,
        purchases: 0,
        invoices: invoice.dataValues.totalAmount || 0,
      });
    }
  }

  // Convert dataMap values to an array
  for (const [, value] of dataMap) {
    chartData.push(value);
  }

  return chartData;
};

const mergeForecastData = (revenueData, forecastData, granularity) => {
  const chartData = [];

  const dataMap = new Map();

  for (const revenue of revenueData) {
    const key =
      granularity === 'yearly'
        ? `${revenue.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${revenue.dataValues.fiscalYear}-${revenue.dataValues.fiscalQuarter}`
          : `${revenue.dataValues.year}-${revenue.dataValues.month}`;
    dataMap.set(key, {
      month: key,
      plannedRevenue: revenue.dataValues.plannedRevenue || 0,
      actualRevenue: revenue.dataValues.actualRevenue || 0,
      forecastRevenue: revenue.dataValues.forecastRevenue || 0,
      deliveryForecast: 0,
      salesForecast: 0,
      revenueForecast: 0,
    });
  }

  for (const forecast of forecastData) {
    const key =
      granularity === 'yearly'
        ? `${forecast.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${forecast.dataValues.fiscalYear}-${forecast.dataValues.fiscalQuarter}`
          : `${forecast.dataValues.year}-${forecast.dataValues.month}`;
    if (dataMap.has(key)) {
      const existingData = dataMap.get(key);
      existingData.deliveryForecast = forecast.dataValues.deliveryForecast || 0;
      existingData.salesForecast = forecast.dataValues.salesForecast || 0;
      existingData.revenueForecast = forecast.dataValues.revenueForecast || 0;
      dataMap.set(key, existingData);
    } else {
      dataMap.set(key, {
        month: key,
        plannedRevenue: 0,
        actualRevenue: 0,
        forecastRevenue: 0,
        deliveryForecast: forecast.dataValues.deliveryForecast || 0,
        salesForecast: forecast.dataValues.salesForecast || 0,
        revenueForecast: forecast.dataValues.revenueForecast || 0,
      });
    }
  }

  for (const [, value] of dataMap) {
    chartData.push(value);
  }

  return chartData;
};

const mergeCummulativeData = (purchaseData, invoicesData, granularity) => {
  const chartData = [];

  // Create a map to store expenses and invoices data
  const dataMap = new Map();

  // Populate dataMap with expenses data
  for (const purchase of purchaseData) {
    const monthKey =
      granularity === 'yearly'
        ? `${purchase.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${purchase.dataValues.fiscalYear}-${purchase.dataValues.fiscalQuarter}`
          : `${purchase.dataValues.year}-${purchase.dataValues.month}`;
    dataMap.set(monthKey, {
      month: monthKey,
      purchases: parseFloat(purchase.dataValues.totalAmount) || 0,
      count: purchase.dataValues.Count,
      invoices: 0,
    });
  }

  // Update dataMap with invoices data
  for (const invoice of invoicesData) {
    const monthKey =
      granularity === 'yearly'
        ? `${invoice.dataValues.fiscalYear}`
        : granularity === 'quarterly'
          ? `${invoice.dataValues.fiscalYear}-${invoice.dataValues.fiscalQuarter}`
          : `${invoice.dataValues.year}-${invoice.dataValues.month}`;
    if (dataMap.has(monthKey)) {
      const existingData = dataMap.get(monthKey);
      existingData.invoices = parseFloat(invoice.dataValues.totalAmount) || 0;
      dataMap.set(monthKey, existingData);
    } else {
      dataMap.set(monthKey, {
        month: monthKey,
        purchases: 0,
        count: 0,
        invoices: parseFloat(invoice.dataValues.totalAmount) || 0,
      });
    }
  }

  // Convert dataMap values to an array
  for (const [, value] of dataMap) {
    chartData.push(value);
  }

  return chartData;
};

module.exports = {
  oppRegionCount,
  projectStatusCount,
  totalOpportunityCount,
  oppCreatedLastWeek,
  totalUserCount,
  totalProjectCount,
  getMissionCardCount,
  oppWonLastWeek,
  oppQueryCount,
  getLatestOpportunities,
  getExpensesAndInvoicesData,
  getPurchaseAmount,
  getTotalPurchase,
  getLatestPurchaseOrders,
  getPurchaseGraphAmounts,
  getPurchaseStats,
  getLatestExpenses,
  getLatestPoAndInvoiceData,
  getExpenseAmount,
  getLatestForecastsByDate,
  getForecastSum,
  getRevenueSum,
  getInvoiceSum,
  getMissionLeaderCount,
  getForecastAndRevenueData,
  getTotalRevenue,
  getPlannedData,
  getActualData,
  getDeliveryData,
  getSalesData,
  getforecastData,
  getOpportunityCountByCluster,
  getProjectWonCountByCluster,
  getCummulativeGraphData,
  getPoExcelData,
};
