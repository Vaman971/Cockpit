const { QueryTypes, Op } = require('sequelize');
const sequelize = require('../db/connection');
const ForecastModel = require('../models/forecastModel');
const PurchaseOrder = require('../models/poModel');
const ExtentionInvoice = require('../models/extentionInvoice');
const ExtentionModel = require('../models/extentionModel');
const InvoiceModel = require('../models/invoiceModel');
const MissionCard = require('../models/missionModel');

/*Helper Functions */

// helper function to get quarter
const getQuarter = (date) => {
  const month = date.getMonth() + 1;
  return Math.ceil(month / 3);
};

// helper funcion for sorting data
const sortData = (data, filter) => {
  if (filter === 'monthly') {
    // Sort by year first, then by month
    return data.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      }
      return a.year - b.year;
    });
  } else if (filter === 'quarterly') {
    // Sort by fiscalYear first, then by fiscalQuarter
    return data.sort((a, b) => {
      if (a.fiscalYear === b.fiscalYear) {
        return a.fiscalQuarter - b.fiscalQuarter;
      }
      return a.fiscalYear - b.fiscalYear;
    });
  } else if (filter === 'yearly') {
    // Sort by fiscalYear
    return data.sort((a, b) => a.fiscalYear - b.fiscalYear);
  } else {
    throw new Error("Invalid filter type. Expected 'monthly', 'quarterly', or 'yearly'.");
  }
};

//helper function for merging data
const mergeCummulativeData = (mergedpurchaseData, invoicesData, granularity) => {
  const chartData = [];
  // Create a map to store expenses and invoices data
  const dataMap = new Map();

  // Populate dataMap with expenses data
  for (const purchase of mergedpurchaseData) {
    const dateKey =
      granularity === 'yearly'
        ? `${purchase.fiscalYear}`
        : granularity === 'quarterly'
          ? `${purchase.fiscalYear}-${purchase.fiscalQuarter}`
          : `${purchase.year}-${purchase.month}`;
    dataMap.set(dateKey, {
      date: dateKey,
      purchases: parseFloat(purchase.totalPurchaseOrder) || 0,
      invoices: 0,
    });
  }

  // Update dataMap with invoices data
  for (const invoice of invoicesData) {
    const dateKey =
      granularity === 'yearly'
        ? `${invoice.fiscalYear}`
        : granularity === 'quarterly'
          ? `${invoice.fiscalYear}-${invoice.fiscalQuarter}`
          : `${invoice.year}-${invoice.month}`;
    if (dataMap.has(dateKey)) {
      const existingData = dataMap.get(dateKey);
      existingData.invoices = parseFloat(invoice.revenueRecognized) || 0;
      dataMap.set(dateKey, existingData);
    } else {
      dataMap.set(dateKey, {
        date: dateKey,
        purchases: 0,
        invoices: parseFloat(invoice.revenueRecognized) || 0,
      });
    }
  }

  // Convert dataMap values to an array
  for (const [, value] of dataMap) {
    chartData.push(value);
  }

  return chartData;
};

// Helper function to get conversion rate for a specific year
const getCurrencyConversionRate = async (fromCurrency, toCurrency, conversionYear) => {
  try {
    const apiUrl = `http://localhost:8000/currency/conversion`;
    // console.log(apiUrl)
    const response = await fetch(
      `${apiUrl}?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&year=${conversionYear}`
    );
    // console.log(response)
    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`Error fetching conversion rate: ${response.statusText}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    // console.log(data)
    // Return the conversion rate
    const rate = data.toRate;
    return rate;
  } catch (error) {
    console.error('Error fetching conversion rate:', error);
    return null;
  }
};

/*Controllers for financial APIs*/

//Delivery Forecast
const getDeliveryInfo = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query; // Get currency from query, default to 'USD'
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

    // Get DeliverySumThisQuarter data
    let DeliverySumThisQuarter = await ForecastModel.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('forcast_date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('delivery_forcast')), 'totalDeliveryForcast'],
        'currencyCode',
      ],
      where: {
        forcastDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['month', 'currencyCode', 'year'],
      order: [[sequelize.fn('MONTH', sequelize.col('forcast_date')), 'ASC']],
    });

    // Get OverallSum data
    let OverallSum = await ForecastModel.findAll({
      attributes: [
        [sequelize.literal('cluster'), 'cluster'],
        [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('delivery_forcast')), 'totalDeliveryForcast'],
        'currencyCode',
      ],
      where: {
        forcastDate: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['cluster', 'currencyCode', 'year'],
    });

    // Convert DeliverySumThisQuarter based on currency and year of the forcastDate
    // Aggregate DeliverySumThisQuarter by month
    const aggregatedDeliverySum = {};
    for (const delivery of DeliverySumThisQuarter) {
      const month = delivery.get('month');
      const year = delivery.get('year');

      // Create a unique key for each month-year combination
      const key = `${month}-${year}`;

      const fromCurrency = delivery.get('currencyCode');
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const convertedForecast = delivery.get('totalDeliveryForcast') * conversionRate;

        // If the key exists, add to the total; otherwise, initialize it
        if (aggregatedDeliverySum[key]) {
          aggregatedDeliverySum[key].totalDeliveryForcast += convertedForecast;
        } else {
          aggregatedDeliverySum[key] = {
            month,
            year,
            totalDeliveryForcast: convertedForecast,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }

    // Transform aggregatedDeliverySum back to an array
    DeliverySumThisQuarter = Object.values(aggregatedDeliverySum);

    // Aggregate OverallSum by cluster and year
    const aggregatedOverallSum = {};
    for (const overall of OverallSum) {
      const cluster = overall.get('cluster');
      const year = overall.get('year');

      // Create a unique key for each cluster-year combination
      const key = `${cluster}-${year}`;

      const fromCurrency = overall.get('currencyCode');
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const convertedForecast = overall.get('totalDeliveryForcast') * conversionRate;

        // If the key exists, add to the total; otherwise, initialize it
        if (aggregatedOverallSum[key]) {
          aggregatedOverallSum[key].totalDeliveryForcast += convertedForecast;
        } else {
          aggregatedOverallSum[key] = {
            cluster,
            year,
            totalDeliveryForcast: convertedForecast,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }

    // Transform aggregatedOverallSum back to an array
    OverallSum = Object.values(aggregatedOverallSum);

    res.status(200).json({ DeliverySumThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Planned Revenue IPMS
const getforecastInfo = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
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

    let ForecastSumThisQuarter = await ForecastModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('revenue_forcast')), 'totalRevenueForecast'],
        'currencyCode',
      ],
      where: {
        forcastDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['currencyCode', 'year'],
    });

    let OverallSum = await ForecastModel.findAll({
      attributes: [
        'cluster',
        [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('revenue_forcast')), 'totalRevenueForecast'],
        [sequelize.literal('updated_at'), 'updatedAt'],
        'currencyCode',
      ],
      where: {
        forcastDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      group: ['cluster', 'updatedAt', 'year', 'currencyCode'],
    });

    let ForecastSumThisMonth = await ForecastModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('revenue_forcast')), 'totalRevenueForecast'],
        'currencyCode',
      ],
      where: {
        forcastDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      group: ['year', 'currencyCode'],
    });

    const aggregatedForecastThisQuarter = {};
    for (const forecast of ForecastSumThisQuarter) {
      const fromCurrency = forecast.get('currencyCode');
      const year = forecast.get('year');

      const key = `${year}`;

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const totalForecast = forecast.get('totalRevenueForecast') * conversionRate;

        if (aggregatedForecastThisQuarter[key]) {
          aggregatedForecastThisQuarter[key].totalRevenueForecast += totalForecast;
        } else {
          aggregatedForecastThisQuarter[key] = {
            year,
            totalRevenueForecast: totalForecast,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
    ForecastSumThisQuarter = Object.values(aggregatedForecastThisQuarter);

    const aggregatedOverallSum = {};
    for (const overall of OverallSum) {
      const fromCurrency = overall.get('currencyCode');
      const cluster = overall.get('cluster');
      const updatedAt = overall.get('updatedAt');
      const year = overall.get('year'); // Year based on forcastDate

      const key = `${year}-${cluster}`;
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const totalDelivery = overall.get('totalRevenueForecast') * conversionRate;
        if (aggregatedOverallSum[key]) {
          aggregatedOverallSum[key].totalRevenueForecast += totalDelivery;
        } else {
          aggregatedOverallSum[key] = {
            year,
            cluster,
            updatedAt,
            totalRevenueForecast: totalDelivery,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
    // console.log(aggregatedOverallSum)
    OverallSum = Object.values(aggregatedOverallSum);

    const aggregatedForecastThisMonth = {};
    for (const forecastMonth of ForecastSumThisMonth) {
      const fromCurrency = forecastMonth.get('currencyCode');
      const year = forecastMonth.get('year');

      const key = `${year}`;
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const totalForecastMonth = forecastMonth.get('totalRevenueForecast') * conversionRate;

        if (aggregatedForecastThisMonth[key]) {
          aggregatedForecastThisMonth[key].totalRevenueForecast += totalForecastMonth;
        } else {
          aggregatedForecastThisMonth[key] = {
            year,
            totalRevenueForecast: totalForecastMonth,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
    ForecastSumThisMonth = Object.values(aggregatedForecastThisMonth);

    res.status(200).json({ ForecastSumThisQuarter, OverallSum, ForecastSumThisMonth });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Revenue Projection
const getRevenueProjectionInfo = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
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

    // Fetch upcoming revenue projection from ExtentionInvoice
    const RevenueProjectionFromExtention = await ExtentionInvoice.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [
          sequelize.fn('SUM', sequelize.col('extentioninvoice.revenue_projection')),
          'totalRevenueProjection',
        ],
        'currencyCode',
      ],
      where: {
        invoiceDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['year', 'currencyCode'],
    });

    // Fetch ongoing revenue projection from PurchaseOrder's forecast amounts
    const RevenueProjectionFromPurchaseOrder = await InvoiceModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('forecast_amount')), 'totalRevenueProjection'],
        'currencyCode',
      ],
      where: {
        invoice_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['year', 'currencyCode'],
    });

    // Combine the data from both sources
    const revenueProjectionMap = {};
    const processProjections = async (data) => {
      for (const record of data) {
        const year = record.get('year');
        const fromCurrency = record.get('currencyCode');
        const projection = parseFloat(record.get('totalRevenueProjection'));

        // Get conversion rate for the year and convert projection
        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

        if (conversionRate) {
          const convertedProjection = projection * conversionRate;

          const key = `${year}-${currency}`;
          if (!revenueProjectionMap[key]) {
            revenueProjectionMap[key] = { totalRevenueProjection: 0 };
          }
          revenueProjectionMap[key].totalRevenueProjection += convertedProjection;
        } else {
          console.error(
            `Conversion rate not available for ${fromCurrency} to ${currency} for year ${year}`
          );
        }
      }
    };

    // Process both sets of data
    await processProjections(RevenueProjectionFromExtention);
    await processProjections(RevenueProjectionFromPurchaseOrder);

    // console.log(revenueProjectionMap)

    // Convert the map to an array for final output
    const RevenueProjectionThisQuarter = Object.keys(revenueProjectionMap).map((key) => {
      // const [year, currencyCode] = key.split('-');
      return {
        // year: parseInt(year, 10),
        // currencyCode,
        totalRevenueProjection: revenueProjectionMap[key].totalRevenueProjection,
      };
    });

    // Fetch overall sum from ExtentionInvoice, aggregated by cluster
    const OverallSumFromExtention = await ExtentionInvoice.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [sequelize.col('invoiceExtention.cluster'), 'cluster'],
        [
          sequelize.fn('SUM', sequelize.col('extentioninvoice.revenue_projection')),
          'totalRevenueProjection',
        ],
        'currencyCode',
      ],
      include: [
        {
          model: ExtentionModel,
          as: 'invoiceExtention',
          attributes: [],
        },
      ],
      where: {
        invoiceDate: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['invoiceExtention.cluster', 'currencyCode', 'year'],
    });

    // Fetch overall sum from PurchaseOrder's forecast amounts, aggregated by cluster
    const OverallSumFromPurchaseOrder = await InvoiceModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [sequelize.col('invoicePo.cluster'), 'cluster'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'totalRevenueProjection'],
        'currencyCode',
      ],
      include: [
        {
          model: PurchaseOrder,
          as: 'invoicePo',
          attributes: [], // Don't include RevenueModel attributes in the result
        },
      ],
      where: {
        invoice_date: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['invoicePo.cluster', 'year', 'currencyCode'],
    });

    // console.log(OverallSumFromPurchaseOrder)

    // Combine OverallSum projections by cluster
    const overallSumMap = {};

    const processOverallSum = async (data) => {
      for (const record of data) {
        const year = record.get('year');
        const cluster = record.get('cluster');
        const fromCurrency = record.get('currencyCode');
        const projection = parseFloat(record.get('totalRevenueProjection'));

        // Get conversion rate for the year and convert projection
        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

        if (conversionRate) {
          const convertedProjection = projection * conversionRate;

          const key = `${year}-${cluster}-${currency}`;
          if (!overallSumMap[key]) {
            overallSumMap[key] = { totalRevenueProjection: 0 };
          }
          overallSumMap[key].totalRevenueProjection += convertedProjection;
        } else {
          console.error(
            `Conversion rate not available for ${fromCurrency} to ${currency} for year ${year}`
          );
        }
      }
    };

    // console.log(overallSumMap)

    await processOverallSum(OverallSumFromExtention);
    await processOverallSum(OverallSumFromPurchaseOrder);

    // Convert the map to an array for final output
    const OverallSum = Object.keys(overallSumMap).map((key) => {
      const [year, cluster] = key.split('-');
      return {
        // year: parseInt(year, 10),
        cluster,
        // currencyCode,
        totalRevenueProjection: overallSumMap[key].totalRevenueProjection,
      };
    });

    res.status(200).json({ RevenueProjectionThisQuarter, OverallSum });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Revenue Recognized
const getRevenueRecognizedInfo = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
    const today = new Date();
    const year = today.getFullYear();
    const currentQuarter = getQuarter(today);
    const lastQuarter = currentQuarter - 1 > 0 ? currentQuarter - 1 : 4;

    // console.log(currency);

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

    let RevenueRecognizedThisQuarter = await InvoiceModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'totalRevenueRecognized'],
        'currencyCode',
      ],
      where: {
        invoice_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['year', 'currencyCode'],
    });

    let OverallSum = await InvoiceModel.findAll({
      attributes: [
        [sequelize.col('invoicePo.cluster'), 'cluster'],
        [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'totalRevenueRecognized'],
        'currencyCode',
      ],
      include: [
        {
          model: PurchaseOrder,
          as: 'invoicePo',
          attributes: [],
        },
      ],
      where: {
        invoice_date: {
          [Op.between]: [new Date(`${year}-04-01`), new Date(`${year + 1}-03-31`)],
        },
      },
      group: ['invoicePo.cluster', 'currencyCode', 'year'],
    });

    const aggregatedOverallSum = {};
    for (const overall of OverallSum) {
      const cluster = overall.get('cluster');
      const fromCurrency = overall.get('currencyCode');
      const year = overall.get('year');
      const key = `${year}-${cluster}`;

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      // console.log(conversionRate)
      const totalRevenueRecognized = overall.get('totalRevenueRecognized') * (conversionRate || 1);

      if (aggregatedOverallSum[key]) {
        aggregatedOverallSum[key].totalRevenueRecognized += totalRevenueRecognized;
      } else {
        aggregatedOverallSum[key] = {
          cluster,
          totalRevenueRecognized,
        };
      }
    }
    // Convert object to array
    OverallSum = Object.values(aggregatedOverallSum);

    const aggregatedRevenueReconized = {};
    for (const revenueRecognized of RevenueRecognizedThisQuarter) {
      const fromCurrency = revenueRecognized.get('currencyCode');
      const year = revenueRecognized.get('year');
      const key = `${year}`;

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const totalRevenueRecognized =
          revenueRecognized.get('totalRevenueRecognized') * conversionRate;
        if (aggregatedRevenueReconized[key]) {
          aggregatedRevenueReconized[key].totalRevenueRecognized += totalRevenueRecognized;
        } else {
          aggregatedRevenueReconized[key] = {
            totalRevenueRecognized: totalRevenueRecognized,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
    RevenueRecognizedThisQuarter = Object.values(aggregatedRevenueReconized);

    res.status(200).json({ RevenueRecognizedThisQuarter, OverallSum });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// RevenueRecognized Pie chart based on cluster and region
const getRevenueRecognizedPieChart = async (req, res) => {
  try {
    const { query, currency = 'USD' } = req.query;
    // Group the revenue data by cluster or region and calculate the sum of planned, actual, and forecast revenue
    if (query === 'cluster') {
      const revenueByCluster = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
          [sequelize.literal(`cluster`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(po_price, 0)')), 'totalAmount'],
          'currencyCode',
        ],
        group: ['cluster', 'year', 'currencyCode'],
      });

      // currency conversion
      for (const revenue of revenueByCluster) {
        const fromCurrency = revenue.get('currencyCode');
        const year = revenue.get('year');

        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

        if (conversionRate) {
          const totalRevenue = revenue.get('totalAmount') * conversionRate;
          revenue.setDataValue('totalAmount', totalRevenue); // Update with converted value
        } else {
          console.error(`Conversion rate not available for year ${year}`);
        }
      }

      // Aggregating data by range (cluster or region)
      const aggregatedData = {};
      for (const revenue of revenueByCluster) {
        const range = revenue.get('range');
        const totalAmount = revenue.get('totalAmount');

        if (aggregatedData[range]) {
          aggregatedData[range] += totalAmount; // Sum totalAmount for existing range
        } else {
          aggregatedData[range] = totalAmount; // Initialize with first totalAmount
        }
      }

      // Transform aggregatedData into an array format for response
      const result = Object.entries(aggregatedData).map(([range, totalAmount]) => ({
        range,
        totalAmount,
      }));

      res.json(result);
    } else {
      const revenueByRegion = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
          [sequelize.literal(`region`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(po_price, 0)')), 'totalAmount'],
          'currencyCode',
        ],
        group: ['region', 'currencyCode', 'year'],
      });

      // currency conversion
      for (const revenue of revenueByRegion) {
        const fromCurrency = revenue.get('currencyCode');
        const year = revenue.get('year');

        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

        if (conversionRate) {
          const totalRevenue = revenue.get('totalAmount') * conversionRate;
          revenue.setDataValue('totalAmount', totalRevenue); // Update with converted value
        } else {
          console.error(`Conversion rate not available for year ${year}`);
        }
      }

      const aggregatedData = {};
      for (const revenue of revenueByRegion) {
        const range = revenue.get('range');
        const totalAmount = revenue.get('totalAmount');

        if (aggregatedData[range]) {
          aggregatedData[range] += totalAmount; // Sum totalAmount for existing range
        } else {
          aggregatedData[range] = totalAmount; // Initialize with first totalAmount
        }
      }

      // Transform aggregatedData into an array format for response
      const result = Object.entries(aggregatedData).map(([range, totalAmount]) => ({
        range,
        totalAmount,
      }));

      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for revenue & extension
const getForecastAndExtensionData = async (req, res) => {
  const { cluster, region, filter = 'monthly', currencyCode = 'USD' } = req.query;
  const groupBy = ['currencyCode'];

  if (filter === 'yearly' || filter === 'quarterly') {
    groupBy.push('fiscalYear');
  } else {
    groupBy.push('year');
  }

  if (filter === 'quarterly') {
    groupBy.push('fiscalQuarter');
  } else if (filter === 'yearly') {
    groupBy.push('fiscalYear');
  } else {
    groupBy.push('month');
  }

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

  const fiscalYearExtention = `CASE
  WHEN MONTH(invoice_date) >= 4 THEN YEAR(invoice_date) + 1
  ELSE YEAR(invoice_date)
END`;
  const fiscalQuarterExtention = `CASE
  WHEN MONTH(invoice_date) BETWEEN 4 AND 6 THEN 1
  WHEN MONTH(invoice_date) BETWEEN 7 AND 9 THEN 2
  WHEN MONTH(invoice_date) BETWEEN 10 AND 12 THEN 3
  ELSE 4
END`;

  const fiscalYearForecast = `CASE
  WHEN MONTH(forcast_date) >= 4 THEN YEAR(forcast_date) + 1
  ELSE YEAR(forcast_date)
END`;
  const fiscalQuarterForecast = `CASE
  WHEN MONTH(forcast_date) BETWEEN 4 AND 6 THEN 1
  WHEN MONTH(forcast_date) BETWEEN 7 AND 9 THEN 2
  WHEN MONTH(forcast_date) BETWEEN 10 AND 12 THEN 3
  ELSE 4
END`;

  try {
    // Fetch and convert Delivery Forecast and Revenue Forecast data from ForecastModel
    const forecasts = await ForecastModel.findAll({
      where: {
        ...(cluster && { cluster }),
        ...(region && { region }),
      },
      attributes: [
        'currencyCode',
        filter === 'yearly' || filter === 'quarterly'
          ? [sequelize.literal(fiscalYearForecast), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('forcast_date')), 'year'],
        filter === 'quarterly'
          ? [sequelize.literal(fiscalQuarterForecast), 'fiscalQuarter']
          : filter === 'yearly'
            ? [sequelize.literal(fiscalYearForecast), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('forcast_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('delivery_forcast')), 'deliveryForecast'],
        [sequelize.fn('SUM', sequelize.col('revenue_forcast')), 'revenueForecast'],
      ],
      group: groupBy,
    });

    // console.log(forecasts)
    const forecastData = await Promise.all(
      forecasts.map(async (forecast) => {
        const year =
          filter === 'monthly' ? forecast.dataValues.year : forecast.dataValues.fiscalYear;
        const conversionRate = await getCurrencyConversionRate(
          forecast.dataValues.currencyCode,
          currencyCode,
          year
        );

        // console.log(forecast);

        if (filter === 'monthly') {
          return {
            year: forecast.dataValues.year,
            month: forecast.dataValues.month,
            deliveryForecast: forecast.dataValues.deliveryForecast * conversionRate,
            revenueForecast: forecast.dataValues.revenueForecast * conversionRate,
          };
        } else if (filter === 'quarterly') {
          return {
            fiscalYear: forecast.dataValues.fiscalYear,
            fiscalQuarter: forecast.dataValues.fiscalQuarter,
            deliveryForecast: forecast.dataValues.deliveryForecast * conversionRate,
            revenueForecast: forecast.dataValues.revenueForecast * conversionRate,
          };
        } else {
          return {
            fiscalYear: forecast.dataValues.fiscalYear,
            deliveryForecast: forecast.dataValues.deliveryForecast * conversionRate,
            revenueForecast: forecast.dataValues.revenueForecast * conversionRate,
          };
        }
      })
    );

    // Fetch and convert Revenue Recognized from InvoiceModel
    const invoices = await InvoiceModel.findAll({
      attributes: [
        'currencyCode',
        filter === 'yearly' || filter === 'quarterly'
          ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        filter === 'quarterly'
          ? [sequelize.literal(fiscalQuarterInvoice), 'fiscalQuarter']
          : filter === 'yearly'
            ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'revenueRecognized'],
        [sequelize.fn('SUM', sequelize.col('forecast_amount')), 'revenueProjection'],
      ],
      include: [
        {
          model: PurchaseOrder,
          as: 'invoicePo',
          where: {
            ...(cluster && { cluster }),
            ...(region && { region }),
          },
          attributes: [],
        },
      ],
      group: groupBy,
    });

    const mergedInvoices = [...invoices].reduce((acc, curr) => {
      if (filter === 'monthly') {
        const key = `${curr.dataValues.year} - ${curr.dataValues.month}`;
        if (!acc[key]) {
          acc[key] = {
            year: curr.dataValues.year,
            month: curr.dataValues.month,
            revenueRecognized: 0,
            revenueProjection: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        acc[key].revenueProjection += Number(curr.dataValues.revenueProjection) || 0;
        return acc;
      } else if (filter === 'yearly') {
        const key = `${curr.dataValues.fiscalYear}`;
        if (!acc[key]) {
          acc[key] = {
            fiscalYear: curr.dataValues.fiscalYear,
            revenueRecognized: 0,
            revenueProjection: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        acc[key].revenueProjection += Number(curr.dataValues.revenueProjection) || 0;
        return acc;
      } else {
        const key = `${curr.dataValues.fiscalYear}-${curr.dataValues.fiscalQuarter}`;
        if (!acc[key]) {
          acc[key] = {
            fiscalQuarter: curr.dataValues.fiscalQuarter,
            fiscalYear: curr.dataValues.fiscalYear,
            revenueRecognized: 0,
            revenueProjection: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        acc[key].revenueProjection += Number(curr.dataValues.revenueProjection) || 0;
        return acc;
      }
    }, []);

    const invoiceData = await Promise.all(
      Object.values(mergedInvoices).map(async (invoice) => {
        // const { fiscalYear, fiscalQuarter } = getFiscalYearAndQuarter(new Date(invoice.invoiceDate));
        // console.log(invoice);
        const year = filter === 'monthly' ? invoice.year : invoice.fiscalYear;

        const conversionRate = await getCurrencyConversionRate(
          invoice.currencyCode,
          currencyCode,
          year
        );

        if (filter === 'monthly') {
          return {
            year: invoice.year,
            month: invoice.month,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
            revenueProjection: invoice.revenueProjection * conversionRate,
          };
        } else if (filter === 'quarterly') {
          return {
            fiscalYear: invoice.fiscalYear,
            fiscalQuarter: invoice.fiscalQuarter,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
            revenueProjection: invoice.revenueProjection * conversionRate,
          };
        } else {
          return {
            fiscalYear: invoice.fiscalYear,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
            revenueProjection: invoice.revenueProjection * conversionRate,
          };
        }
      })
    );

    // Fetch and convert Revenue Projection from ExtentionInvoice and InvoiceModel
    const extentionInvoices = await ExtentionInvoice.findAll({
      attributes: [
        'currencyCode',
        filter === 'yearly' || filter === 'quarterly'
          ? [sequelize.literal(fiscalYearExtention), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        filter === 'quarterly'
          ? [sequelize.literal(fiscalQuarterExtention), 'fiscalQuarter']
          : filter === 'yearly'
            ? [sequelize.literal(fiscalYearExtention), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [
          sequelize.fn('SUM', sequelize.col('extentioninvoice.revenue_projection')),
          'revenueProjection',
        ],
      ],
      include: [
        {
          model: ExtentionModel,
          as: 'invoiceExtention',
          where: {
            ...(cluster && { cluster }),
            ...(region && { region }),
          },
          attributes: [],
        },
      ],
      group: [...groupBy],
    });

    // console.log(extentionInvoices)
    const extentionInvoiceData = await Promise.all(
      extentionInvoices.map(async (extentionInvoice) => {
        // const { fiscalYear, fiscalQuarter } = getFiscalYearAndQuarter(new Date(extentionInvoice.invoiceDate));
        const year =
          filter === 'monthly'
            ? extentionInvoice.dataValues.year
            : extentionInvoice.dataValues.fiscalYear;
        const conversionRate = await getCurrencyConversionRate(
          extentionInvoice.dataValues.currencyCode,
          currencyCode,
          year
        );

        if (filter === 'monthly') {
          return {
            year: extentionInvoice.dataValues.year,
            month: extentionInvoice.dataValues.month,
            revenueProjection: extentionInvoice.dataValues.revenueProjection * conversionRate,
          };
        } else if (filter === 'quarterly') {
          return {
            fiscalYear: extentionInvoice.dataValues.fiscalYear,
            fiscalQuarter: extentionInvoice.dataValues.fiscalQuarter,
            revenueProjection: extentionInvoice.dataValues.revenueProjection * conversionRate,
          };
        } else {
          return {
            fiscalYear: extentionInvoice.dataValues.fiscalYear,
            deliveryForecast: extentionInvoice.dataValues.deliveryForecast * conversionRate,
            revenueProjection: extentionInvoice.dataValues.revenueProjection * conversionRate,
          };
        }
      })
    );

    // Merging Revenue Projection data from both sources
    const mergedRevenueProjectionData = [...invoiceData, ...extentionInvoiceData].reduce(
      (acc, curr) => {
        if (filter === 'monthly') {
          const key = `${curr.year} - ${curr.month}`;
          if (!acc[key]) {
            acc[key] = { year: curr.year, month: curr.month, revenueProjection: 0 };
          }
          acc[key].revenueProjection += curr.revenueProjection || 0;
          return acc;
        } else if (filter === 'yearly') {
          const key = `${curr.fiscalYear}`;
          if (!acc[key]) {
            acc[key] = { fiscalYear: curr.fiscalYear, revenueProjection: 0 };
          }
          acc[key].revenueProjection += curr.revenueProjection || 0;
          return acc;
        } else {
          const key = `${curr.fiscalYear}-${curr.fiscalQuarter}`;
          if (!acc[key]) {
            acc[key] = {
              fiscalQuarter: curr.fiscalQuarter,
              fiscalYear: curr.fiscalYear,
              revenueProjection: 0,
            };
          }
          acc[key].revenueProjection += curr.revenueProjection || 0;
          return acc;
        }
      },
      {}
    );

    // console.log(mergedRevenueProjectionData)

    // Combine and structure response data for line charts
    let responseData = {};

    if (filter === 'monthly') {
      responseData = {
        deliveryForecast: forecastData.map((item) => ({
          year: item.year,
          month: item.month,
          amount: item.deliveryForecast,
        })),
        revenueForecast: forecastData.map((item) => ({
          year: item.year,
          month: item.month,
          amount: item.revenueForecast,
        })),
        revenueRecognized: invoiceData.map((item) => ({
          year: item.year,
          month: item.month,
          amount: item.revenueRecognized,
        })),
        revenueProjection: Object.values(mergedRevenueProjectionData).map((item) => ({
          year: item.year,
          month: item.month,
          amount: item.revenueProjection,
        })),
      };
    } else if (filter === 'yearly') {
      responseData = {
        deliveryForecast: forecastData.map((item) => ({
          fiscalYear: item.fiscalYear,
          amount: item.deliveryForecast,
        })),
        revenueForecast: forecastData.map((item) => ({
          fiscalYear: item.fiscalYear,
          amount: item.revenueForecast,
        })),
        revenueRecognized: invoiceData.map((item) => ({
          fiscalYear: item.fiscalYear,
          amount: item.revenueRecognized,
        })),
        revenueProjection: Object.values(mergedRevenueProjectionData).map((item) => ({
          fiscalYear: item.fiscalYear,
          amount: item.revenueProjection,
        })),
      };
    } else {
      responseData = {
        deliveryForecast: forecastData.map((item) => ({
          fiscalYear: item.fiscalYear,
          fiscalQuarter: item.fiscalQuarter,
          amount: item.deliveryForecast,
        })),
        revenueForecast: forecastData.map((item) => ({
          fiscalYear: item.fiscalYear,
          fiscalQuarter: item.fiscalQuarter,
          amount: item.revenueForecast,
        })),
        revenueRecognized: invoiceData.map((item) => ({
          fiscalYear: item.fiscalYear,
          fiscalQuarter: item.fiscalQuarter,
          amount: item.revenueRecognized,
        })),
        revenueProjection: Object.values(mergedRevenueProjectionData).map((item) => ({
          fiscalYear: item.fiscalYear,
          fiscalQuarter: item.fiscalQuarter,
          amount: item.revenueProjection,
        })),
      };
    }

    const finalData = {};
    // Determine the key structure based on the filter
    if (filter === 'monthly') {
      // Build finalData
      responseData.deliveryForecast.forEach((item) => {
        const key = `${item.year}-${item.month}`;
        if (!finalData[key]) {
          finalData[key] = {
            year: item.year,
            month: item.month,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].deliveryForecast = item.amount;
      });

      responseData.revenueForecast.forEach((item) => {
        const key = `${item.year}-${item.month}`;
        if (!finalData[key]) {
          finalData[key] = {
            year: item.year,
            month: item.month,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].plannedRevenue = item.amount;
      });

      responseData.revenueRecognized.forEach((item) => {
        const key = `${item.year}-${item.month}`;
        if (!finalData[key]) {
          finalData[key] = {
            year: item.year,
            month: item.month,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueRecognize = item.amount;
      });

      responseData.revenueProjection.forEach((item) => {
        const key = `${item.year}-${item.month}`;
        if (!finalData[key]) {
          finalData[key] = {
            year: item.year,
            month: item.month,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueProjection = item.amount;
      });
    } else if (filter === 'yearly') {
      // Build finalData
      responseData.deliveryForecast.forEach((item) => {
        const key = `${item.fiscalYear}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].deliveryForecast = item.amount;
      });

      responseData.revenueForecast.forEach((item) => {
        const key = `${item.fiscalYear}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].plannedRevenue = item.amount;
      });

      responseData.revenueRecognized.forEach((item) => {
        const key = `${item.fiscalYear}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueRecognize = item.amount;
      });

      responseData.revenueProjection.forEach((item) => {
        const key = `${item.fiscalYear}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueProjection = item.amount;
      });
    } else if (filter === 'quarterly') {
      // Build finalData
      responseData.deliveryForecast.forEach((item) => {
        const key = `${item.fiscalYear}-Q${item.fiscalQuarter}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            fiscalQuarter: item.fiscalQuarter,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].deliveryForecast = item.amount;
      });

      responseData.revenueForecast.forEach((item) => {
        const key = `${item.fiscalYear}-Q${item.fiscalQuarter}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            fiscalQuarter: item.fiscalQuarter,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].plannedRevenue = item.amount;
      });

      responseData.revenueRecognized.forEach((item) => {
        const key = `${item.fiscalYear}-Q${item.fiscalQuarter}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            fiscalQuarter: item.fiscalQuarter,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueRecognize = item.amount;
      });

      responseData.revenueProjection.forEach((item) => {
        const key = `${item.fiscalYear}-Q${item.fiscalQuarter}`;
        if (!finalData[key]) {
          finalData[key] = {
            fiscalYear: item.fiscalYear,
            fiscalQuarter: item.fiscalQuarter,
            deliveryForecast: 0,
            plannedRevenue: 0,
            revenueRecognize: 0,
            revenueProjection: 0,
          };
        }
        finalData[key].revenueProjection = item.amount;
      });
    }
    // let data = finalData
    // console.log(finalData);
    const newData = Object.values(finalData);
    // console.log(newData);
    const sortedData = sortData(newData, filter);
    // console.log(sortedData);

    res.json(sortedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

// Controller for Po and Invoice data
const getPoAndInvoiceData = async (req, res) => {
  const { cluster, region, filter = 'yearly', currencyCode = 'USD' } = req.query;
  const groupBy = ['currencyCode'];

  if (filter === 'yearly' || filter === 'quarterly') {
    groupBy.push('fiscalYear');
  } else {
    groupBy.push('year');
  }

  if (filter === 'quarterly') {
    groupBy.push('fiscalQuarter');
  } else if (filter === 'yearly') {
    groupBy.push('fiscalYear');
  } else {
    groupBy.push('month');
  }

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

  const fiscalYearPurchase = `CASE 
WHEN MONTH(po_date) >= 4 THEN YEAR(po_date) + 1
ELSE YEAR(po_date)
END`;
  const fiscalQuarterPurchase = `CASE
WHEN MONTH(po_date) BETWEEN 4 AND 6 THEN 1
WHEN MONTH(po_date) BETWEEN 7 AND 9 THEN 2
WHEN MONTH(po_date) BETWEEN 10 AND 12 THEN 3
ELSE 4
END`;

  try {
    const purchases = await PurchaseOrder.findAll({
      attributes: [
        'currencyCode',
        filter === 'yearly' || filter === 'quarterly'
          ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
        filter === 'quarterly'
          ? [sequelize.literal(fiscalQuarterPurchase), 'fiscalQuarter']
          : filter === 'yearly'
            ? [sequelize.literal(fiscalYearPurchase), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('po_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('po_amount')), 'totalAmount'],
      ],
      group: groupBy, // Filter out null values
      where: {
        ...(cluster && { cluster }),
        ...(region && { region }),
      },
      order: [[sequelize.fn('MAX', sequelize.col('po_date')), 'DESC']],
    });
    // console.log(purchases);

    const invoices = await InvoiceModel.findAll({
      attributes: [
        'currencyCode',
        filter === 'yearly' || filter === 'quarterly'
          ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
          : [sequelize.fn('YEAR', sequelize.col('invoice_date')), 'year'],
        filter === 'quarterly'
          ? [sequelize.literal(fiscalQuarterInvoice), 'fiscalQuarter']
          : filter === 'yearly'
            ? [sequelize.literal(fiscalYearInvoice), 'fiscalYear']
            : [sequelize.fn('MONTH', sequelize.col('invoice_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('invoice_amount')), 'revenueRecognized'],
      ],
      include: [
        {
          model: PurchaseOrder,
          as: 'invoicePo',
          where: {
            ...(cluster && { cluster }),
            ...(region && { region }),
          },
          attributes: [],
        },
      ],
      group: groupBy,
      order: [[sequelize.fn('MAX', sequelize.col('invoice_date')), 'DESC']],
    });

    const mergedInvoices = [...invoices].reduce((acc, curr) => {
      if (filter === 'monthly') {
        const key = `${curr.dataValues.year} - ${curr.dataValues.month}`;
        if (!acc[key]) {
          acc[key] = {
            year: curr.dataValues.year,
            month: curr.dataValues.month,
            revenueRecognized: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        return acc;
      } else if (filter === 'yearly') {
        const key = `${curr.dataValues.fiscalYear}`;
        if (!acc[key]) {
          acc[key] = {
            fiscalYear: curr.dataValues.fiscalYear,
            revenueRecognized: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        return acc;
      } else {
        const key = `${curr.dataValues.fiscalYear}-${curr.dataValues.fiscalQuarter}`;
        if (!acc[key]) {
          acc[key] = {
            fiscalQuarter: curr.dataValues.fiscalQuarter,
            fiscalYear: curr.dataValues.fiscalYear,
            revenueRecognized: 0,
            currencyCode: curr.dataValues.currencyCode,
          };
        }
        acc[key].revenueRecognized += Number(curr.dataValues.revenueRecognized) || 0;
        return acc;
      }
    }, []);

    const purchaseData = await Promise.all(
      purchases.map(async (purchase) => {
        const year =
          filter === 'monthly' ? purchase.dataValues.year : purchase.dataValues.fiscalYear;
        const conversionRate = await getCurrencyConversionRate(
          purchase.dataValues.currencyCode,
          currencyCode,
          year
        );

        if (filter === 'monthly') {
          return {
            year: purchase.dataValues.year,
            month: purchase.dataValues.month,
            totalPurchaseOrder: purchase.dataValues.totalAmount * conversionRate,
          };
        } else if (filter === 'quarterly') {
          return {
            fiscalYear: purchase.dataValues.fiscalYear,
            fiscalQuarter: purchase.dataValues.fiscalQuarter,
            totalPurchaseOrder: purchase.dataValues.totalAmount * conversionRate,
          };
        } else {
          return {
            fiscalYear: purchase.dataValues.fiscalYear,
            totalPurchaseOrder: purchase.dataValues.totalAmount * conversionRate,
          };
        }
      })
    );

    const mergedpurchaseData = [...purchaseData].reduce((acc, curr) => {
      if (filter === 'monthly') {
        const key = `${curr.year} - ${curr.month}`;
        if (!acc[key]) {
          acc[key] = { year: curr.year, month: curr.month, totalPurchaseOrder: 0 };
        }
        acc[key].totalPurchaseOrder += Number(curr.totalPurchaseOrder) || 0;
        return acc;
      } else if (filter === 'yearly') {
        const key = `${curr.fiscalYear}`;
        if (!acc[key]) {
          acc[key] = { fiscalYear: curr.fiscalYear, totalPurchaseOrder: 0 };
        }
        acc[key].totalPurchaseOrder += Number(curr.totalPurchaseOrder) || 0;
        return acc;
      } else {
        const key = `${curr.fiscalYear}-${curr.fiscalQuarter}`;
        if (!acc[key]) {
          acc[key] = {
            fiscalQuarter: curr.fiscalQuarter,
            fiscalYear: curr.fiscalYear,
            totalPurchaseOrder: 0,
          };
        }
        acc[key].totalPurchaseOrder += Number(curr.totalPurchaseOrder) || 0;
        return acc;
      }
    }, []);

    const invoiceData = await Promise.all(
      Object.values(mergedInvoices).map(async (invoice) => {
        // const { fiscalYear, fiscalQuarter } = getFiscalYearAndQuarter(new Date(invoice.invoiceDate));
        const year = filter === 'monthly' ? invoice.year : invoice.fiscalYear;
        // console.log(invoice)
        const conversionRate = await getCurrencyConversionRate(
          invoice.currencyCode,
          currencyCode,
          year
        );

        if (filter === 'monthly') {
          return {
            year: invoice.year,
            month: invoice.month,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
          };
        } else if (filter === 'quarterly') {
          return {
            fiscalYear: invoice.fiscalYear,
            fiscalQuarter: invoice.fiscalQuarter,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
          };
        } else {
          return {
            fiscalYear: invoice.fiscalYear,
            revenueRecognized: invoice.revenueRecognized * conversionRate,
          };
        }
      })
    );

    const chartData = mergeCummulativeData(Object.values(mergedpurchaseData), invoiceData, filter);

    chartData.sort((a, b) => {
      if (filter === 'yearly') {
        // Sort only by year
        // console.log(a.month.split("-")[0], b.month.split("-")[0]);
        const aYear = a.date.split('-')[0];
        const bYear = b.date.split('-')[0];

        if (Number(aYear) < Number(bYear)) {
          return -1;
        }
        if (Number(aYear) > Number(bYear)) {
          return 1;
        }

        return 0;
      } else {
        // For other granularities, sort by year and then by month or quarter
        if (filter === 'quarterly') {
          const [aYear, aQuarter] = a.date.split('-').map(Number);
          const [bYear, bQuarter] = b.date.split('-').map(Number);

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
          const [aYear, aMonth] = a.date.split('-').map(Number);
          const [bYear, bMonth] = b.date.split('-').map(Number);

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

    // Send the response with the cumulative data
    res.status(200).json(chartData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Purchase Order Pie chart based on cluster and region
const getPurchaseOrderPieChart = async (req, res) => {
  try {
    const { query, currency = 'USD' } = req.query;
    // Group the revenue data by cluster or region and calculate the sum of planned, actual, and forecast revenue
    if (query === 'cluster') {
      const purchaseByCluster = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
          [sequelize.literal(`cluster`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(po_amount, 0)')), 'totalAmount'],
          'currencyCode',
        ],
        group: ['cluster', 'year', 'currencyCode'],
      });

      // currency conversion
      for (const purchase of purchaseByCluster) {
        const fromCurrency = purchase.get('currencyCode');
        const year = purchase.get('year');
        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
        // console.log('from currency: ' + fromCurrency);
        // console.log('to currency: ' + currency);
        // console.log('conversion factor: ' + conversionRate);

        if (conversionRate) {
          const totalRevenue = purchase.get('totalAmount') * conversionRate;
          purchase.setDataValue('totalAmount', totalRevenue); // Update with converted value
        } else {
          console.error(`Conversion rate not available for year ${year}`);
        }
      }
      console.log(purchaseByCluster);
      // Aggregating data by range (cluster or region)
      const aggregatedData = {};
      for (const purchase of purchaseByCluster) {
        const range = purchase.get('range');
        const totalAmount = purchase.get('totalAmount');

        if (aggregatedData[range]) {
          aggregatedData[range] += totalAmount; // Sum totalAmount for existing range
        } else {
          aggregatedData[range] = totalAmount; // Initialize with first totalAmount
        }
      }

      // Transform aggregatedData into an array format for response
      const result = Object.entries(aggregatedData).map(([range, totalAmount]) => ({
        range,
        totalAmount,
      }));

      res.json(result);
    } else {
      const purchaseByRegion = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
          [sequelize.literal(`region`), 'range'],
          [sequelize.fn('SUM', sequelize.literal('COALESCE(po_amount, 0)')), 'totalAmount'],
          'currencyCode',
        ],
        group: ['region', 'currencyCode', 'year'],
      });

      // currency conversion
      for (const purchase of purchaseByRegion) {
        const fromCurrency = purchase.get('currencyCode');
        const year = purchase.get('year');

        const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

        if (conversionRate) {
          const totalRevenue = purchase.get('totalAmount') * conversionRate;
          purchase.setDataValue('totalAmount', totalRevenue); // Update with converted value
        } else {
          console.error(`Conversion rate not available for year ${year}`);
        }
      }

      const aggregatedData = {};
      for (const purchase of purchaseByRegion) {
        const range = purchase.get('range');
        const totalAmount = purchase.get('totalAmount');

        if (aggregatedData[range]) {
          aggregatedData[range] += totalAmount; // Sum totalAmount for existing range
        } else {
          aggregatedData[range] = totalAmount; // Initialize with first totalAmount
        }
      }

      // Transform aggregatedData into an array format for response
      const result = Object.entries(aggregatedData).map(([range, totalAmount]) => ({
        range,
        totalAmount,
      }));

      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// mission leader PO Controller
const getPurchaseByMissionLeaderGraph = async (req, res) => {
  const { currency = 'USD' } = req.query;
  try {
    // Fetch all missions
    const latestMissionCards = await MissionCard.findAll();
    const missionIds = latestMissionCards.map((mission) => mission.id);

    // Retrieve all purchase orders associated with the mission cards
    const purchaseOrders = await PurchaseOrder.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'],
        [sequelize.literal('po_amount'), 'poAmount'],
        'currencyCode',
        'poMissionId',
      ],
      where: {
        poMissionId: {
          [Op.in]: missionIds,
        },
      },
      group: ['currencyCode', 'year', 'poAmount', 'poMissionId'],
    });

    // currency conversion
    for (const purchase of purchaseOrders) {
      const fromCurrency = purchase.get('currencyCode');
      const year = purchase.get('year');

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      // console.log(conversionRate)
      if (conversionRate) {
        const totalPurchase = purchase.get('poAmount') * conversionRate;
        purchase.setDataValue('poAmount', totalPurchase); // Update with converted value
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
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
    // Transform the result to the desired format and sort to get the top 5
    const result = Object.entries(purchaseAmountsByLeader)
      .map(([missionLeader, purchaseTotal]) => ({
        missionLeader,
        purchaseTotal,
      }))
      .sort((a, b) => b.purchaseTotal - a.purchaseTotal) // Sort by purchaseTotal in descending order
      .slice(0, 5); // Get the top 5

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Upcoming PO's in next 30 days graph
const getLatestPurchaseOrderProgress = async (req, res) => {
  const { currency = 'USD' } = req.query;

  try {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);

    const latestPurchaseOrders = await sequelize.query(
      `SELECT 
          po.po_number AS poNumber,
          po.po_price AS poPrice,
          po.po_amount AS poAmount,
          po.po_description AS poDescription,
          YEAR(po.po_date) as year,
          po.currency_code AS currencyCode,
          m.airbus_id,
          m.mission_description
       FROM 
          purchaseorders po
       LEFT JOIN 
          missioncards m ON po.po_mission_id = m.id
       WHERE 
          po.po_date BETWEEN :currentDate AND :futureDate
       ORDER BY 
          po.po_date, po.currency_code
       `,
      {
        type: QueryTypes.SELECT,
        replacements: { currentDate, futureDate },
      }
    );

    for (const purchase of latestPurchaseOrders) {
      const year = purchase.year;
      const currencyCode = purchase.currencyCode;
      const conversionRate = await getCurrencyConversionRate(currencyCode, currency, year);

      if (conversionRate) {
        const totalPurchaseAmount = purchase.poAmount * conversionRate;
        purchase.poAmount = totalPurchaseAmount; // Update with converted value

        const totalPurchasePrice = purchase.poPrice * conversionRate;
        purchase.poPrice = totalPurchasePrice;
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }

    res.json(latestPurchaseOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PO count and amount graph
const getPurchaseInfo = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query; // Get currency from query, default to 'USD'
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Group purchase orders by year
    const purchaseOrdersByYear = await PurchaseOrder.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('po_date')), 'year'], // Group by year
        [sequelize.fn('SUM', sequelize.col('po_amount')), 'totalPurchaseAmount'], // Total per year
        'currencyCode', // Keep track of the currency
      ],
      where: {
        poDate: {
          [Op.between]: [startDate, currentDate],
        },
      },
      group: ['year', 'currencyCode'], // Group by year and currency
    });

    let totalPurchaseAmountConverted = 0;

    // Loop through each year's purchase orders and apply conversion
    for (const purchaseData of purchaseOrdersByYear) {
      const year = purchaseData.get('year');
      const fromCurrency = purchaseData.get('currencyCode');
      const yearlyTotal = purchaseData.get('totalPurchaseAmount');

      // Fetch conversion rate for that year
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      console.log(conversionRate);

      if (conversionRate) {
        totalPurchaseAmountConverted += yearlyTotal * conversionRate;
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }

    // Query for purchase stats (grouped by month/year) for the graph
    let purchaseStats = await PurchaseOrder.findAll({
      attributes: [
        [
          sequelize.fn(
            'CONCAT',
            sequelize.fn('YEAR', sequelize.col('po_date')),
            '-',
            sequelize.fn('MONTH', sequelize.col('po_date'))
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

    // Convert and format the purchaseStats
    purchaseStats = purchaseStats.map((stat) => {
      const [year, month] = stat.get('monthYear').split('-');
      return {
        monthYear: stat.get('monthYear'),
        purchaseCount: stat.get('purchaseCount'),
        date: new Date(year, month - 1),
      };
    });

    // Sort by date
    purchaseStats.sort((a, b) => a.date - b.date);

    // Clean up response
    purchaseStats = purchaseStats.map((stat) => ({
      monthYear: stat.monthYear,
      purchaseCount: stat.purchaseCount,
    }));

    res.status(200).json({
      purchaseStats,
      totalPurchaseAmount: totalPurchaseAmountConverted.toFixed(2),
      currency,
    });
  } catch (error) {
    console.error('Error fetching Purchase stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPurchaseInfo,
  getDeliveryInfo,
  getforecastInfo,
  getRevenueProjectionInfo,
  getRevenueRecognizedInfo,
  getRevenueRecognizedPieChart,
  getForecastAndExtensionData,
  getPoAndInvoiceData,
  getPurchaseOrderPieChart,
  getPurchaseByMissionLeaderGraph,
  getLatestPurchaseOrderProgress,
};
