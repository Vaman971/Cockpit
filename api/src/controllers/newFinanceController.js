const { Op } = require('sequelize');
const sequelize = require('../db/connection');
const moment = require('moment');
const ExtentionModel = require('../models/extentionModel');
const ExtentionInvoice = require('../models/extentionInvoice');
const ForecastModel = require('../models/forecastModel');
const PurchaseOrder = require('../models/poModel');
const InvoiceModel = require('../models/invoiceModel');
const OpportunityModel = require('../models/opportunityModel');
const logger = require('../utils/logger');

const getQuarter = (date) => {
  const month = date.getMonth() + 1;
  return Math.ceil(month / 3);
};

const getCurrencyConversionRate = async (fromCurrency, toCurrency, conversionYear) => {
  try {
    const apiUrl = `http://localhost:8000/currency/conversion`;
    const response = await fetch(
      `${apiUrl}?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&year=${conversionYear}`
    );
    //console.log(response)
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

const getMonthDifference = (start, end) => {
  const startDate = moment(start).toDate();
  const endDate = moment(end).toDate();

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
};

const getRevenueData = async (req, res, next) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const { currency = 'USD' } = req.query;
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

    let extensionSumThisQuarter = await ExtentionInvoice.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('invoiceDate')), 'year'],
        [
          sequelize.fn('SUM', sequelize.col('extentioninvoice.revenueProjection')),
          'totalExtentionRevenue',
        ],
        'currencyCode',
      ],
      where: {
        invoiceDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ['currencyCode', 'year'],
    });

    const aggregatedExtensionThisQuarter = {};
    for (const extention of extensionSumThisQuarter) {
      const fromCurrency = extention.get('currencyCode');
      const year = extention.get('year');

      const key = `${year}`;

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);

      if (conversionRate) {
        const totalExtention = extention.get('totalExtentionRevenue') * conversionRate;

        if (aggregatedExtensionThisQuarter[key]) {
          aggregatedExtensionThisQuarter[key].totalExtentionRevenue += totalExtention;
        } else {
          aggregatedExtensionThisQuarter[key] = {
            year,
            totalExtentionRevenue: totalExtention,
          };
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }
    extensionSumThisQuarter = Object.values(aggregatedExtensionThisQuarter);

    const { cluster, region } = req.query;

    // filters the data based on current month and six months +
    const startOfCurrentMonth = moment().startOf('month').toDate();
    const endOfSixthMonth = moment().add(6, 'months').endOf('month').toDate();

    const filter = {};
    const oppoFilter = {};

    if (region) {
      filter.region = region;
      oppoFilter.OpRegion = region;
    }

    if (cluster) {
      filter.cluster = cluster;
      oppoFilter.cluster = cluster;
    }

    const [data, forecastData, poData, oppoData] = await Promise.all([
      ExtentionModel.findAll({
        where: {
          [Op.and]: [
            filter,
            {
              [Op.or]: [
                { extentionStartDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
                { extentionEndDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
              ],
            },
          ],
        },
      }),
      ForecastModel.findAll({
        where: {
          [Op.and]: [
            filter,
            {
              forcastDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] },
            },
          ],
        },
      }),
      PurchaseOrder.findAll({
        where: {
          [Op.and]: [
            filter,
            {
              [Op.or]: [
                { poDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
                { poEndDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
              ],
            },
          ],
        },
      }),
      OpportunityModel.findAll({
        where: {
          [Op.and]: [
            oppoFilter,
            {
              [Op.or]: [
                { MissionStartDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
                { MissionEndDate: { [Op.between]: [startOfCurrentMonth, endOfSixthMonth] } },
              ],
            },
          ],
        },
      }),
    ]);
    const extensions = data.map((doc) => doc.toJSON());
    const forecasts = forecastData.map((doc) => doc.toJSON());
    const purchaseOrders = poData.map((doc) => doc.toJSON());
    const opportunities = oppoData.map((doc) => doc.toJSON());

    const revenueDistribution = {};

    startMonth = moment().startOf('month');

    for (let i = 0; i < 9; i++) {
      const monthKey = startMonth.clone().add(i, 'months').format('YYYY-MM');
      revenueDistribution[monthKey] = {
        high: 0,
        medium: 0,
        low: 0,
        ExpectedDealSize: 0,
        deliveryForcast: 0,
        poConfirmed: 0,
      };
    }

    for (const row of extensions) {
      let startDate = moment(row.extentionStartDate);
      const endDate = moment(row.extentionEndDate);
      const fromCurrency = row.currencyCode;
      const year = 2025;
      const trimStart = moment().startOf('month');

      const totalMonths = getMonthDifference(startDate, endDate);

      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      let monthlyRevenue = {};
      if (conversionRate) {
        monthlyRevenue = (conversionRate * row.revenueProjection) / totalMonths;
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }

      if (startDate.isBefore(trimStart)) {
        startDate = trimStart;
      }

      const monthsBetween = getMonthDifference(startDate, endDate);

      for (let i = 0; i < monthsBetween; i++) {
        const currentMonth = startDate.clone().add(i, 'months').format('YYYY-MM');

        if (!revenueDistribution[currentMonth]) {
          revenueDistribution[currentMonth] = { high: 0, medium: 0, low: 0, deliveryForcast: 0 };
        }

        if (row.likeliness === 'High') {
          revenueDistribution[currentMonth].high += monthlyRevenue;
        } else if (row.likeliness === 'Medium') {
          revenueDistribution[currentMonth].medium += monthlyRevenue;
        } else if (row.likeliness === 'Low') {
          revenueDistribution[currentMonth].low += monthlyRevenue;
        }
      }
    }
    for (const row of opportunities) {
      const missionStart = row.MissionStartDate ? moment(row.MissionStartDate) : null;
      const missionEnd = row.MissionEndDate ? moment(row.MissionEndDate) : null;

      // missionStart and missionEnd are now either moment objects or null.

      const totalMonths =
        missionStart && missionEnd ? getMonthDifference(missionStart, missionEnd) : 1;
      const fromCurrency = row.currencyCode;
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      if (conversionRate) {
        const convertedOppo = (conversionRate * row.ExpectedDealSize) / totalMonths;
        if (row.MarkedOpp === true && row.status !== 'Won') {
          for (let i = 0; i < totalMonths; i++) {
            const currentMonth = missionStart.clone().add(i, 'months').format('YYYY-MM');
            if (!revenueDistribution[currentMonth]) {
              revenueDistribution[currentMonth] = {
                high: 0,
                medium: 0,
                low: 0,
                ExpectedDealSize: 0,
                deliveryForcast: 0,
                poConfirmed: 0,
              };
            }
            revenueDistribution[currentMonth].ExpectedDealSize += Number(convertedOppo);
          }
        }
      } else {
        console.error(`Conversion rate not available for year ${year}`);
      }
    }

    for (const row of forecasts) {
      const forecastMonth = moment(row.forcastDate).format('YYYY-MM');
      const fromCurrency = row.currencyCode;
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      if (conversionRate) {
        const convertedForecast = conversionRate * row.deliveryForcast;
        if (revenueDistribution[forecastMonth]) {
          revenueDistribution[forecastMonth].deliveryForcast += convertedForecast; // needed currency conversion
        }
      }
    }

    for (const row of purchaseOrders) {
      const poEndDate = moment(row.poEndDate).format('YYYY-MM');
      const fromCurrency = row.currencyCode;
      const conversionRate = await getCurrencyConversionRate(fromCurrency, currency, year);
      const invoice = await InvoiceModel.findAll({
        where: { po_id: row.id },
      });

      const invoices = invoice.map((doc) => doc.toJSON());
      if (conversionRate) {
        const convertedInvoice = row.poPrice === null ? 0 : conversionRate * row.poPrice;
        let totalInvoiceAmount = 0;
        invoices.forEach((item) => {
          totalInvoiceAmount += parseFloat(item.forecastAmount);
        });
        if (invoices.length === 0) {
          if (revenueDistribution[poEndDate]) {
            revenueDistribution[poEndDate].poConfirmed += convertedInvoice; //needed currency conversion
          }
        } else {
          for (const item of invoices) {
            let convertedInvoiceAmount;
            const invoiceMonth = moment(item.invoiceDate).format('YYYY-MM');
            if (totalInvoiceAmount > 0) {
              convertedInvoiceAmount = conversionRate * totalInvoiceAmount; // Properly assigning the variable
            } else {
              convertedInvoiceAmount =
                item.forecastAmount === '0.00' ? 0 : conversionRate * item.forecastAmount;
            }
            if (revenueDistribution[invoiceMonth]) {
              revenueDistribution[invoiceMonth].poConfirmed += convertedInvoiceAmount; // Needed currency conversion
            }
          }
        }
      }
    }

    const responseData = Object.keys(revenueDistribution).map((month) => ({
      month,
      ...revenueDistribution[month],
    }));
    res.json(responseData);
  } catch (error) {
    logger.error('getRevenueData error:', error);
    next(error);
  }
};

module.exports = { getRevenueData };
