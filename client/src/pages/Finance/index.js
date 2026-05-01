import { useEffect, useState } from "react";
import numeral from "numeral";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import Dropdown from "../../components/Dropdown";
import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
import IconDollarSign from "../../components/Icon/IconDollarSign";
import IconCashBanknotes from "../../components/Icon/IconCashBanknotes";
import IconEye from "../../components/Icon/IconEye";
import api from "../../axios";

const Finance = () => {
  const [data, setData] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [poData, setPoData] = useState([]);
  const [financeGraphData, setFinanceGraphData] = useState([]);
  const [graphCluster, setGraphCluster] = useState("");
  const [forecastCluster, setForecastCluster] = useState("");
  const [graphRange, setGraphRange] = useState([]);
  const [graphInvoiceData, setGraphInvoiceData] = useState([]);
  const [graphPurchaseData, setGraphPurchaseData] = useState([]);
  const [graphPurchaseCount, setGraphPurchaseCount] = useState([])
  const [forecastGraphRange, setForecastGraphRange] = useState([]);
  const [graphPlannedRevenueData, setGraphPlannedRevenueData] = useState([]);
  const [graphActualRevenueData, setGraphActualRevenueData] = useState([]);
  const [graphForecastRevenueData, setGraphForecastRevenueData] = useState([]);
  const [graphDeliveryForecastData, setGraphDeliveryForecastData] = useState([]);
  const [graphSalesForecastData, setGraphSalesForecastData] = useState([]);
  const [graphRevenueForecastData, setGraphRevenueForecastData] = useState([]);
  const [totalPurchase, setTotalPurchase] = useState(0);
  const [forecastData, setForecastData] = useState({});
  const [forecastLastQuarterData, setForecastLastQuarterData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [revenueLastQuarterData, setRevenueLastQuarterData] = useState({});
  const [revenueByCategoryRange, setRevenueByCategoryRange] = useState([]);
  const [revenueByCategoryAmount, setRevenueByCategoryAmount] = useState([]);
  const [revenueQuery, setRevenueQuery] = useState("cluster");
  const [purchaseCategory, setPurchaseCategory] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState([]);
  const [purchaseGraphRange, setPurchaseGraphRange] = useState([]);
  const [purchaseGraphData, setPurchaseGraphData] = useState([]);
  const [purchaseGraphAmount, setPurchaseGraphAmount] = useState(0);
  const [recentPo, setRecentPo] = useState([]);
  const [totalPurchaseOrder, SetTotalPurchaseOrder] = useState([]);
  const [purchaseLeader, SetPurchaseLeader] = useState([]);
  const [totalPurchaseAmount, SetTotalPurchaseAmount] = useState(0);
  const [totalPurchaseAmountLastQuarter, SetTotalPurchaseAmountLastQuarter]=useState(0);
  const [purchaseByStatus, SetPurchaseByStatus] = useState([]);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState(0);
  const [totalInvoiceAmountLastQuarter, setTotalInvoiceAmountLastQuarter] =useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [query, setQuery] = useState("monthly");
  const [purchaseQuery, setPurchaseQuery] = useState("cluster");
  const [forecastQuery, setForecastQuery] = useState("monthly");
  const [region, setRegion] = useState("");
  const [forecastRegion, setForecastRegion] = useState("");
  const [deliveryAmountThisQuarter, setDeliveryAmountThisQuarter] =useState("");
  const [salesAmountThisQuarter, setSalesAmountThisQuarter] = useState("");
  const [plannedAmountThisQuarter, setPlannedAmountThisQuarter] = useState("");
  const [actualAmountThisQuarter, setActualAmountThisQuarter] = useState("");
  const [revenueAmountThisQuarter, setRevenueAmountThisQuarter] = useState("");
  const [revenueAmountThisMonth, setRevenueAmountThisMonth] = useState('');
  const [deliveryDataThisYear, setDeliveryDataThisYear] = useState([]);
  const [salesDataThisYear, setSalesDataThisYear] = useState([]);
  const [plannedDataThisYear, setPlannedDataThisYear] = useState([]);
  const [actualDataThisYear, setActualDataThisYear] = useState([]);
  const [revenueDataThisYear, setRevenueDataThisYear] = useState([]);
  const [deliverySum, setDeliverySum] = useState(0);
  const [salesSum, setSalesSum] = useState(0);
  const [actualSum, setActualSum] = useState(0);
  const [plannedSum, setPlannedSum] = useState(0);
  const [revenueDate, setRevenueDate] = useState('');
  const {currentUser} = useSelector((state) => state.user);
  
  const [loading] = useState(false);

  useEffect(() => {
    if (currentUser.user.user_type === 'Leader' || currentUser.user.user_type === 'Admin') {
      fetchFinanceGraphData();
      fetchPurchaseBarData();
      fetchPurchaseData();
      fetchPurchaseCardData();
      // fetchRecentInvoiceData();
      fetchPurchaseOrderData();
      fetchPurchaseGraphData();
      // fetchLatestExpense();
      // fetchLatestPoAndExpenses();
      fetchRevenueByCategory();
      fetchLatestTablePo();
      fetchLatestTableForecast();
      fetchForecastData();
      fetchRevenueData();
      fetchInvoiceCardData();
      fetchForecastGraph();
      fetchprofileData();
      fetchDeliveryData();
      fetchSalesData();
      fetchPlannedData();
      fetchActualRevenue();
      fetchPlannedRevenue();
    }
  }, [
    query,
    graphCluster,
    forecastQuery,
    forecastCluster,
    revenueQuery,
    purchaseQuery,
    region,
    forecastRegion,
  ]);

  const fetchDeliveryData = async () => {
    try {
      const res = await api.get(`/analytics/getDeliveryData`, {
        withCredentials: true,
      });
      const data = res.data;
      console.log(data.salesAmountThisQuarter);
      if (data.success === false) {
        console.log(data.message);
      } else {
        setDeliveryAmountThisQuarter(
          data.DeliverySumThisQuarter.map((value) => parseFloat(value.totalDeliveryForcast)).reduce((accumulator, currentValue) => accumulator + (currentValue || 0))
        );
        setDeliveryDataThisYear(data.DeliverySumThisQuarter);
        setDeliverySum(
          data.OverallSum.filter(
            (data) =>
              data.cluster === "MNT" ||
              data.cluster === "SNPS" ||
              data.cluster === "MEBM" ||
              data.cluster === "Other"
          )
            .map((value) => parseFloat(value.totalDeliveryForcast)) // Convert strings to numbers
            .reduce(
              (accumulator, currentValue) => accumulator + (currentValue || 0),
              0
            )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchSalesData = async () => {
    try {
      const res = await api.get(`/analytics/getSalesData`, {
        withCredentials: true,
      });
      const data = res.data;
      // console.log(data.salesAmountThisQuarter)
      if (data.success === false) {
        console.log(data.message);
      } else {
        setSalesAmountThisQuarter(
          data.SalesSumThisQuarter[0].totalSalesForcast
        );
        setSalesDataThisYear(data.OverallSum);

        setSalesSum(
          data.OverallSum.filter(
            (data) =>
              data.cluster === "MNT" ||
              data.cluster === "SNPS" ||
              data.cluster === "MEBM" ||
              data.cluster === "Other"
          )
            .map((value) => parseFloat(value.totalSalesForcast)) // Convert strings to numbers
            .reduce(
              (accumulator, currentValue) => accumulator + (currentValue || 0),
              0
            )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchPlannedData = async () => {
    try {
      const res = await api.get(`/analytics/getPlannedData`, {
        withCredentials: true,
      });
      const data = res.data;
      // console.log(data.salesAmountThisQuarter)
      if (data.success === false) {
        console.log(data.message);
      } else {
        setPlannedAmountThisQuarter(
          data.PlannedSumThisQuarter[0].totalPlannedRevenue
        );
        setPlannedDataThisYear(data.OverallSum);

        setPlannedSum(
          data.OverallSum.filter(
            (data) =>
              data.cluster === "MNT" ||
              data.cluster === "SNPS" ||
              data.cluster === "MEBM" ||
              data.cluster === "Other"
          )
            .map((value) => parseFloat(value.totalPlannedRevenue)) // Convert strings to numbers
            .reduce(
              (accumulator, currentValue) => accumulator + (currentValue || 0),
              0
            )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchActualRevenue = async () => {
    try {
      const res = await api.get(`/analytics/getActaulData`, {
        withCredentials: true,
      });
      const data = res.data;
      // console.log(data.salesAmountThisQuarter)
      if (data.success === false) {
        console.log(data.message);
      } else {
        setActualAmountThisQuarter(
          data.ActualSumThisQuarter[0].totalActualRevenue
        );
        setActualDataThisYear(data.OverallSum);

        setActualSum(
          data.OverallSum.filter(
            (data) =>
              data.cluster === "MNT" ||
              data.cluster === "SNPS" ||
              data.cluster === "MEBM" ||
              data.cluster === "Other"
          )
            .map((value) => parseFloat(value.totalActualRevenue)) // Convert strings to numbers
            .reduce(
              (accumulator, currentValue) => accumulator + (currentValue || 0),
              0
            )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchPlannedRevenue = async () => {
    try {
      const res = await api.get(`/analytics/getForecastData`, {
        withCredentials: true,
      });
      const data = res.data;
      // console.log(data.salesAmountThisQuarter)
      if (data.success === false) {
        console.log(data.message);
      } else {
        setRevenueAmountThisQuarter(
          data.ForecastSumThisQuarter[0].totalRevenueForecast
        );
        setRevenueAmountThisMonth(
          data.ForecastSumThisMonth[0].totalRevenueForecast
        );
        setRevenueDataThisYear(data.OverallSum);

        setRevenueDate(
          data.OverallSum.filter(
            (data) =>
              data.cluster === "MEBM"
          ).map((value) => value.updatedAt)// Convert strings to numbers
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchprofileData = async () => {
    const res = await api.get(`/profile/getProfiles`, {
      withCredentials: true,
    });
    const data = res.data;
    try {
      if (data.success === false) {
        console.log(data.message);
      } else {
        setProfileData(data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchFinanceGraphData = async () => {
    const res = await api.get(
      `/analytics/getCummulativeGraph?granularity=${query}&cluster=${graphCluster}&region=${region}`,
      {
        withCredentials: true,
      }
    );
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setFinanceGraphData(data);
      setGraphRange(data.map((value) => getMonthName(value.month)));
      setGraphInvoiceData(data.map((value) => value.cumulativeInvoices));
      setGraphPurchaseData(data.map((value) => value.cumulativePurchases));
      setGraphPurchaseCount(data.map((value => value.count)));
    }
  };

  const fetchPurchaseBarData = async () => {
    try {
      const purchaseData = await api.get(
        `/analytics/getPurchaseAmountByMissionLeader`,
        { withCredentials: true }
      );

      const purchaseAmount = purchaseData.data;
      if (purchaseAmount.success === false) {
        console.error(purchaseAmount.message);
      } else {
        SetTotalPurchaseOrder(purchaseAmount.map((po) => po.purchaseTotal));
        SetPurchaseLeader(purchaseAmount.map((po) => po.missionLeader));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPurchaseCardData = async () => {
    try {
      const res = await api.get(`/analytics/getPurchaseAmount`, {
        withCredentials: true,
      });
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
      } else {
        SetTotalPurchaseAmount(data.totalPoAmount);
        SetTotalPurchaseAmountLastQuarter(data.totalPoAmountLastQuarter);
        SetPurchaseByStatus(data.statusCounts);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchInvoiceCardData = async () => {
    try {
      const res = await api.get(`/analytics/getInvoiceSum`, {
        withCredentials: true,
      });
      const data = res.data;

      if (data.success === false) {
        console.log(data.message);
      } else {
        setTotalInvoiceAmount(data.totalInvoiceAmount);
        setTotalInvoiceAmountLastQuarter(data.totalInvoiceAmountLastQuarter);
        setInvoiceCount(data.invoiceCount[0].count);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchLatestTablePo = async () => {
    try {
      const res = await api.get(`/po/getLatestPo`, {
        withCredentials: true,
      });
      const poData = res.data;
      setPoData(poData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLatestTableForecast = async () => {
    try {
      const res = await api.get(`/analytics/getLatestForecast`, {
        withCredentials: true,
      });
      const data = res.data;
      if (data.success === false) {
        console.log(data.message);
      } else {
        setData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPurchaseData = async () => {
    const res = await api.get(
      `/analytics/getTotalPurchase?query=${purchaseQuery}`,
      {
        withCredentials: true,
      }
    );
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setTotalPurchase(data.totalPurchase);
      setPurchaseCategory(
        data.purchaseByCategory.map((category) => category.range)
      );
      setPurchaseAmount(
        data.purchaseByCategory.map((amount) => Number(amount.totalAmount))
      );
    }
  };

  // const fetchRecentInvoiceData = async () => {
  //   const res = await api.get(`/analytics/getLatestInvoiceAmount`, {
  //     withCredentials: true,
  //   });
  //   const data = res.data;

  //   if (data.success === false) {
  //     console.log(data.message);
  //   } else {
  //     setRecentInvoiceAmount(data);
  //     setRecentInvoiceDescription(
  //       data.map((value) => value.poDescription || "no description")
  //     );
  //     setRecentAmountLastMonth(data.map((value) => value.lastMonthTotal));
  //     setRecentAmountThisMonth(data.map((value) => value.thisMonthTotal));
  //   }
  // };

  const fetchPurchaseOrderData = async () => {
    const res = await api.get(`/analytics/getLatestPurchaseOrder`, {
      withCredentials: true,
    });
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setRecentPo(data);
    }
  };

  const fetchPurchaseGraphData = async () => {
    const res = await api.get(`/analytics/getPurchaseStats`, {
      withCredentials: true,
    });
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setPurchaseGraphRange(
        data.purchaseStats.map((date) => getMonthName(date.monthYear))
      );
      setPurchaseGraphData(
        data.purchaseStats.map((count) => count.purchaseCount)
      );
      setPurchaseGraphAmount(data.purchaseAmount[0].totalPurchaseAmount);
    }
  };

  const fetchForecastData = async () => {
    const res = await api.get(`/analytics/getForecastSum`, {
      withCredentials: true,
    });
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setForecastData(data.OverallSum);
      setForecastLastQuarterData(data.lastQuarterSum);
    }
  };

  const fetchRevenueData = async () => {
    const res = await api.get(`/analytics/getRevenueSum`, {
      withCredentials: true,
    });
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setRevenueData(data.OverallSum);
      setRevenueLastQuarterData(data.QuarterSum);
    }
  };

  const fetchForecastGraph = async () => {
    const res = await api.get(
      `/analytics/getForecast?granularity=${forecastQuery}&cluster=${forecastCluster}&region=${forecastRegion}`,
      {
        withCredentials: true,
      }
    );
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setForecastGraphRange(data.map((value) => getDate(value.month)));
      setGraphPlannedRevenueData(data.map((value) => value.plannedRevenue));
      setGraphActualRevenueData(data.map((value) => value.actualRevenue));
      setGraphForecastRevenueData(data.map((value) => value.forecastRevenue));
      setGraphDeliveryForecastData(data.map((value) => value.deliveryForecast));
      setGraphSalesForecastData(data.map((value) => value.salesForecast));
      setGraphRevenueForecastData(data.map((value) => value.revenueForecast));
    }
  };

  const fetchRevenueByCategory = async () => {
    const res = await api.get(
      `/analytics/getRevenueByCategory?query=${revenueQuery}`,
      {
        withCredentials: true,
      }
    );
    const data = res.data;

    if (data.success === false) {
      console.log(data.message);
    } else {
      setRevenueByCategoryRange(data.map((value) => value.range));
      setRevenueByCategoryAmount(
        data.map((value) => Number(value?.totalAmount || 0))
      );
    }
  };

  const formatLargeNumber = (number) => {
    return numeral(number).format("0.0a");
  };

  const getUserName = () => {
    // Map over the purchaseLeader array to find the usernames for each ID
    const userNames = purchaseLeader.map((leaderId) => {
      // Find the user profile corresponding to the leaderId
      // console.log(profileData.find((profile) => profile.userProfileId === 1));
      const userData = profileData.find(
        (profile) => profile.userProfileId === Number(leaderId)
      );
      // console.log(userData)
      // If userData exists, return the username, otherwise return an empty string
      return userData ? userData.username : "";
    });
    // console.log(userValues);

    // console.log(userNames);

    return userNames;
  };

  const getMonthName = (exp) => {
    let newExp = exp.split("-");
    let year = newExp[0];
    let monthNumber = newExp[1];

    const date = new Date();
    date.setFullYear(year);

    if (query === "quarterly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];

      return "Q" + monthNumber + " FY" + fy;
    } else if (query === "yearly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];
      return "FY " + fy;
    } else {
      date.setMonth(monthNumber - 1); // JavaScript months are zero-based (0 = January, 1 = February, ...)
      return date.toLocaleString("en-US", { month: "short" }) + " " + year;
    }
  };

  const getMonth = (month) =>{
    const date = new Date();
    date.setMonth(month -1);

    return date.toLocaleDateString('en-US', {month: "short"});
  }

  const getDate = (exp) => {
    let newExp = exp.split("-");

    let monthNumber = newExp[1];
    let year = newExp[0] || "";
    // console.log(monthNumber);
    // console.log(year);

    const date = new Date();
    date.setFullYear(year);

    if (forecastQuery === "quarterly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];
      return "Q" + monthNumber + " FY" + fy;
    } else if (forecastQuery === "yearly") {
      let val = year.split("");
      let fy = val[val.length - 2] + val[val.length - 1];
      return "FY" + fy;
    } else {
      console.log(year);
      date.setMonth(monthNumber - 1); // JavaScript months are zero-based (0 = January, 1 = February, ...)
      return date.toLocaleString("en-US", { month: "short" }) + " " + year;
    }
  };

  // const formatName = (name) => {
  //   const newName = name.trim().split(" ");

  //   if (newName.length === 1) {
  //     return newName[0][0].toUpperCase();
  //   } else {
  //     const firstLetter = newName[0][0].toUpperCase();
  //     const lastLetter = newName[newName.length - 1][0].toUpperCase();
  //     return firstLetter + lastLetter;
  //   }
  // };

  const formatPoId = (id) => {
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `PO-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  const formatForecastId = (id) => {
    if (id === "-") {
      return "-";
    }
    const idString = id.toString();
    const zerosCount = 5 - idString.length;
    const formattedId = `FR-${"0".repeat(zerosCount)}${idString}`;
    return formattedId;
  };

  //Revenue Chart
  const revenueChart = {
    series: [
      {
        name: "Purchase Orders",
        data: graphPurchaseData,
      },
      {
        name: "Invoiced Amount",
        data: graphInvoiceData,
      },
    ],
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },

      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: ['green','blue'],
      labels: graphRange,
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value) => {
            return value / 1000 + "K";
          },
          offsetX: -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: false,
      },
      grid: {
        borderColor: "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "16px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
      tooltip: {
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: 0.28,
          opacityTo: 0.05,
          stops: [45, 100],
        },
      },
    },
  };


  //Sales By Category=
  const salesByCategory = {
    series: purchaseAmount,
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },

      stroke: {
        show: false,
        width: 25,
        color: "#fff",
      },
      colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],

      labels: purchaseCategory,
      dataLabels: {
        enabled: false,
      },
      states: {
        hover: {
          filter: "none",
        },
      },
      theme: {
        palette: "palette2",
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        height: 50,
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        offsetY: 20,
        fontSize: "14px",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],

      fill: {
        opacity: 1,
        colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],
        type: "solid",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%", // Adjust the size of the donut chart
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                color: undefined,
                offsetY: 16,
                formatter: (val) => {
                  return formatLargeNumber(val);
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w) => {
                  return formatLargeNumber(
                    w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  );
                },
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return formatLargeNumber(val);
          },
        },
      },
    },
  };

  //revenue by category
  const revenueByCategory = {
    series: revenueByCategoryAmount,
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },
      stroke: {
        show: false,
        width: 25,
        color: "#fff",
      },
      colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],
      labels: revenueByCategoryRange,
      dataLabels: {
        enabled: false,
      },
      states: {
        hover: {
          filter: "none",
        },
      },
      theme: {
        palette: "palette2",
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        height: 50,
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        offsetY: 20,
        fontSize: "14px",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      fill: {
        opacity: 1,
        colors: ["#1B55E2", "#E7515A", "#3AC857", "#FFD700", "#9B30FF"],
        type: "solid",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%", // Adjust the size of the donut chart
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                color: undefined,
                offsetY: 16,
                formatter: (val) => {
                  return formatLargeNumber(val);
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w) => {
                  return formatLargeNumber(
                    w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  );
                },
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return formatLargeNumber(val);
          },
        },
      },
    },
  };



  //Mission Leader bar graph
  const dailySales = {
    series: [
      {
        name: "PO Amount",
        data: totalPurchaseOrder,
      },
    ],
    options: {
      chart: {
        height: 160,
        type: "bar",
        fontFamily: "Nunito, sans-serif",
        toolbar: {
          show: false,
        },
        stacked: false,
        stackType: "100%",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
      },
      colors: ["#e2a03f"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -5,
              offsetY: 0,
            },
          },
        },
      ],
      xaxis: {
        labels: {
          show: true,
        },
        categories: getUserName(),
      },
      yaxis: {
        show: false,
      },
      fill: {
        opacity: 1,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "25%",
        },
      },
      legend: {
        show: false,
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            show: false,
          },
        },
        padding: {
          top: 20,
          right: 0,
          bottom: -10,
          left: 0,
        },
      },
    },
  };

  //Total Orders
  const totalOrders = {
    series: [
      {
        name: "PO Count",
        data: purchaseGraphData,
      },
    ],
    options: {
      chart: {
        height: 290,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        sparkline: {
          enabled: true,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: ["#00ab55"],
      labels: purchaseGraphRange,
      yaxis: {
        min: 0,
        show: false,
      },
      grid: {
        padding: {
          top: 125,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: 0.3,
          opacityTo: 0.05,
          stops: [100, 100],
        },
      },
      tooltip: {
        x: {
          show: true,
        },
      },
    },
  };

  const uniqueVisitorSeries = {
    series: [
      {
        name: "Planned Revenue (IPMS)",
        type: 'line',
        color: '#1B55E2',
        data: graphRevenueForecastData,
      },
      {
        name: "Revenue Recognized",
        type: 'bar',
        color:'#2E8B20',  // Updated to a shade of green
        data: graphActualRevenueData,
      },
      {
        name: "Revenue Projection",
        type: 'bar',
        color:'#808080',  // Updated to a shade of gray
        data: graphPlannedRevenueData,
      },
      {
        name: "Delivery Forecast",
        type: 'line',
        color: "#FFA500",
        data: graphDeliveryForecastData,
      },
    ],
    options: {
      chart: {
        height: 360,
        type: "line",  // Ensure the primary type is set correctly
        fontFamily: "Nunito, sans-serif",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [3, 2, 2, 3],  // Define stroke width for both lines and bars
        curve: 'smooth',  // Optional: makes the lines smooth
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        color: "#515365",
        opacity: 0.4,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        itemMargin: {
          horizontal: 8,
          vertical: 8,
        },
      },
      grid: {
        borderColor: "#e0e6ed",
        padding: {
          left: 20,
          right: 20,
        },
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: forecastGraphRange,
        axisBorder: {
          show: true,
          color: "#e0e6ed",
        },
      },
      yaxis: {
        tickAmount: 6,
        opposite: false,
        labels: {
          offsetX: 0,
          formatter: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            }
            return value;
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100],
        },
      },
      tooltip: {
        shared: true,  // Ensure tooltip shows data for all series
        intersect: false,  // Tooltip shows on the closest data point
        marker: {
          show: true,
        },
        y: {
          formatter: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            }
            return value;
          },
        },
      },
    },
  };
  

  return (
    <div>
      <div className="mt-2 text-center p-2 text-white font-semibold text-3xl bg-gradient-to-r from-[#4361ee] to-[#645cba] rounded-lg">
        <span>Financial Dashboard</span>
      </div>
      <div className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
          {/*Forecast*/}

          {/*  PO */}
          <div className="panel bg-gradient-to-r from-purple-500 to-purple-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
              <div className="mr-1 text-md font-semibold">
                Delivery Forecast (Current Quarter)
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="text-3xl font-bold mr-3 ">
                {" "}
                $ {formatLargeNumber(Number(deliveryAmountThisQuarter))}
              </div>
            </div>

            <div className="flex items-center mt-5 w-full justify-between">
              {deliveryDataThisYear.map((data) => (
                <div className="mr-3 font-bold">
                  <div className="mr-1 text-xs font-semibold text-nowrap">
                    {getMonth(parseInt(data.month))}
                  </div>{" "}
                  $ {formatLargeNumber(Number(data.totalDeliveryForcast || 0))}{" "}
                </div>
              ))}
            </div>
            <div className="flex items-center font-semibold mt-5">
              <IconEye className="mr-2 shrink-0" />
              Current FY ${" "}
              {formatLargeNumber(deliverySum)}{" "}
            </div>
          </div>
          {/*  */}
          {/* Invoice */}
          <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
              <div className="mr-1 text-md font-semibold">
                Planned Revenue IPMS (Current Month)
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="text-3xl font-bold mr-3 ">
                {" "}
                $ {formatLargeNumber(revenueAmountThisMonth)}
              </div>
            </div>

            <div className="flex items-center mt-5 justify-between w-full">
              {revenueDataThisYear.map((data) => (
                <div className="mr-3 font-bold">
                  <div className="mr-1 text-xs font-semibold text-nowrap">
                    {data.cluster} <br/>
                  </div>{" "}
                  $ {formatLargeNumber(Number(data.totalRevenueForecast || 0))}{" "}
                </div>
              ))}
            </div>
            <div className="flex items-center font-semibold mt-5">
              <IconEye className="mr-2 shrink-0" />
              Updated On: {new Date(revenueDate).toLocaleDateString('en-US',{dateStyle: 'medium'}) || 'NA'}{" "}
            </div>
          </div>

          <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 flex flex-col justify-between items-start">
            <div className="flex justify-between">
              <div className="mr-1 text-md font-semibold">
                Revenue Projection (Current FY)
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="text-3xl font-bold mr-3 ">
                {" "}
                &euro; {formatLargeNumber(Number(plannedSum))}{" "}
              </div>
            </div>

            <div className="flex items-center mt-5 w-full justify-between">
              {plannedDataThisYear &&
                plannedDataThisYear.map((data) => (
                  <div
                    className="mr-3 font-bold"
                    key={plannedDataThisYear.indexOf(data)}
                  >
                    <div className="mr-1 mt-1 text-xs font-semibold text-nowrap">
                      {data.cluster} <br />
                    </div>
                    <span className="text-nowrap">
                      &euro;{" "}
                      {formatLargeNumber(Number(data.totalPlannedRevenue) || 0)}
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex items-center font-semibold mt-5">
              <IconEye className="mr-2 shrink-0" />
              Current Quarter &euro;{" "}
              {formatLargeNumber(Number(plannedAmountThisQuarter))}
            </div>
          </div>

          {/* Planned */}
          <div className="panel bg-gradient-to-r from-iris to-iris-light3 flex flex-col justify-between items-start">
            <div className="flex justify-between">
              <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">
                Revenue Recognized (Current FY)
              </div>
            </div>
            <div className="flex items-center mt-5">
              <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">
                {" "}
                &euro; {formatLargeNumber(Number(actualSum))}{" "}
              </div>
            </div>
            <div className="flex items-center mt-5 w-full justify-between">
              {actualDataThisYear.map((data) => (
                <div className="mr-3 font-bold">
                  <div className="mr-1 mt-1 text-xs font-semibold text-nowrap">
                    {data.cluster} <br />
                  </div>
                  <span className="text-nowrap">
                    {" "}
                    {formatLargeNumber(Number(data.totalActualRevenue) || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center font-semibold mt-5">
              <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
              Current Quarter &euro;{" "}
              {formatLargeNumber(Number(actualAmountThisQuarter))}
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mb-6">
          {/*Pie Chart*/}
          <div className="panel h-full">
            <div className="flex items-center justify-between mb-5">
              <h5 className="font-semibold text-lg dark:text-white-light">
              Revenue Recognized (till- date)
              </h5>
              <div className="dropdown">
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />
                  }
                  className="mr-8"
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        onClick={() => setRevenueQuery("cluster")}
                      >
                        Cluster
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setRevenueQuery("region")}
                      >
                        Region
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                {loading ? (
                  <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                    <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                  </div>
                ) : (
                  <ReactApexChart
                    series={revenueByCategory.series}
                    options={revenueByCategory.options}
                    type="donut"
                    height={460}
                  />

                  // <ReactApexChart series={revenueCategoryChart.series} options={revenueCategoryChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="bar" height={300} />
                )}
              </div>
            </div>
          </div>

          <div className="panel h-full xl:col-span-2">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
              <h5 className="font-semibold text-lg">Forecast And Revenue</h5>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {forecastRegion.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2 " />
                  }
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("")}
                      >
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("FR")}
                      >
                        France
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("IN")}
                      >
                        India
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("UK")}
                      >
                        United Kingdom
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("DE")}
                      >
                        Germany
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastRegion("ES")}
                      >
                        Spain
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {forecastQuery.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                  }
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastQuery("monthly")}
                      >
                        Monthly
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastQuery("quarterly")}
                      >
                        Quarterly
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastQuery("yearly")}
                      >
                        Yearly
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {forecastCluster.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                  }
                  className="mr-8"
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastCluster("")}
                      >
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastCluster("SNPS")}
                      >
                        S&PS
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastCluster("MNT")}
                      >
                        MNT
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastCluster("MEBM")}
                      >
                        MEBM
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setForecastCluster("Other")}
                      >
                        Other
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>

            {/*Area Chart*/}
            <div className="relative">
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden cursor-pointer">
                {loading ? (
                  <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                    <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                  </div>
                ) : (
                  // <ReactApexChart
                  //   series={forecastChart.series}
                  //   options={forecastChart.options}
                  //   type="area"
                  //   height={325}
                  // />
                  <ReactApexChart
                    options={uniqueVisitorSeries.options}
                    series={uniqueVisitorSeries.series}
                    type="bar"
                    height={325}
                    className="overflow-hidden"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mb-6">
          <div className="panel h-full xl:col-span-2">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
              <h5 className="font-semibold text-lg">PO And Invoiced Amount</h5>

                <p>Total PO: {formatLargeNumber(totalPurchaseAmount)}</p>
                <p>Total Invoiced: {formatLargeNumber(totalInvoiceAmount)}</p>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {region.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                  }
                >
                  <ul>
                    <li>
                      <button type="button" onClick={() => setRegion("")}>
                        All
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setRegion("FR")}>
                        France
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setRegion("IN")}>
                        India
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setRegion("UK")}>
                        United Kingdom
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setRegion("DE")}>
                        Germany
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setRegion("ES")}>
                        Spain
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {query.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                  }
                >
                  <ul>
                    <li>
                      <button type="button" onClick={() => setQuery("monthly")}>
                        Monthly
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setQuery("quarterly")}
                      >
                        Quarterly
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => setQuery("yearly")}>
                        Yearly
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
              <div className="dropdown w-fit h-9 bg-white-light rounded-md text-nowrap whitespace-nowrap flex justify-between">
                <span className="mt-2 mx-3 text-sm">
                  {graphCluster.toUpperCase() || "All"}
                </span>
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary mx-2" />
                  }
                >
                  <ul>
                    <li>
                      <button type="button" onClick={() => setGraphCluster("")}>
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setGraphCluster("SNPS")}
                      >
                        S&PS
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setGraphCluster("MNT")}
                      >
                        MNT
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setGraphCluster("MEBM")}
                      >
                        MEBM
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setGraphCluster("Other")}
                      >
                        Other
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
            {/*Area Chart*/}
            <div className="relative">
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden cursor-crosshair">
                {loading ? (
                  <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                    <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                  </div>
                ) : (
                  <ReactApexChart
                    series={revenueChart.series}
                    options={revenueChart.options}
                    type="area"
                    height={325}
                  />
                )}
              </div>
            </div>
          </div>

          {/*Pie Chart*/}
          <div className="panel h-full">
            <div className="flex items-center justify-between mb-5">
              <h5 className="font-semibold text-lg dark:text-white-light">
                Purchase Order By Category
              </h5>
              <div className="dropdown">
                <Dropdown
                  offset={[0, 1]}
                  placement={`${"bottom-end"}`}
                  button={
                    <IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />
                  }
                  className="mr-8"
                >
                  <ul>
                    <li>
                      <button
                        type="button"
                        onClick={() => setPurchaseQuery("cluster")}
                      >
                        Cluster
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setPurchaseQuery("region")}
                      >
                        Region
                      </button>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
            <div>
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                {loading ? (
                  <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                    <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                  </div>
                ) : (
                  <ReactApexChart
                    series={salesByCategory.series}
                    options={salesByCategory.options}
                    type="donut"
                    height={460}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div className="panel h-full sm:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-5">
              <h5 className="font-semibold text-lg dark:text-white-light">
                Mission Leader Stats
                <span className="block text-white-dark text-sm font-normal">
                  Go to PO Table for details.
                </span>
              </h5>
              <div className="ml-auto relative">
                <div className="w-11 h-11 text-warning bg-warning-light dark:bg-warning dark:text-[#ffeccb] grid place-content-center rounded-full">
                  <IconDollarSign />
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                {loading ? (
                  <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                    <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                  </div>
                ) : (
                  <ReactApexChart
                    series={dailySales.series}
                    options={dailySales.options}
                    type="bar"
                    height={160}
                  />

                  // <ReactApexChart series={pieChartOptions.series} options={pieChartOptions.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="pie" height={250} />
                )}
              </div>
            </div>
          </div>

          <div className="panel h-full">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
              <h5 className="font-semibold text-lg">PO Recieved Vs Total</h5>
            </div>
            <div className="space-y-12 overflow-auto h-52 animated-progress scrollbar-w-2 scrollbar-track-gray-lighter scrollbar-thumb-rounded scrollbar-thumb-gray hover:scrollbar-thumb-gray-dark">
              {recentPo ? (
                recentPo.map((po) => (
                  <div className="flex items-center" key={recentPo.indexOf(po)}>
                    <div className="flex-1">
                      <div className="flex font-semibold text-white-dark mb-2">
                        <h6>{po.poDescription || "-"}: </h6>
                        <p className="ml-auto">{po.poPrice || 0} &euro;</p>
                      </div>
                      <div className="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                        <div
                          className="bg-gradient-to-r from-[#7579ff] to-[#b224ef] h-full rounded-full"
                          style={{
                            width: `${(po.poPrice / po.poAmount) * 100 || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div>Loading ...</div>
              )}
            </div>
          </div>

          <div className="panel h-full p-0">
            <div className="flex items-center justify-between w-full p-5 absolute">
              <div className="relative">
                <div className="text-success dark:text-success-light bg-success-light dark:bg-success w-11 h-11 rounded-lg flex items-center justify-center">
                  <IconCashBanknotes />
                </div>
              </div>
              <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                &euro; {formatLargeNumber(purchaseGraphAmount)}
                <span className="block text-sm font-normal">
                  Total PO (Last 12 Months)
                </span>
              </h5>
            </div>
            <div className="bg-transparent rounded-lg overflow-hidden">
              {/* loader */}
              {loading ? (
                <div className="min-h-[320px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                  <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                </div>
              ) : (
                <ReactApexChart
                  series={totalOrders.series}
                  options={totalOrders.options}
                  type="area"
                  height={310}
                />
              )}
            </div>
          </div>
        </div>
        {/* <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <div className="panel h-full sm:col-span-2 xl:col-span-1 pb-0">
            <h5 className="font-semibold text-lg dark:text-white-light mb-5">
              Recent Expenses
            </h5>
            <div className="relative h-[320px] pr-3 -mr-3 mb-4 overflow-auto">
              <div className="text-sm cursor-pointer ">
                {latestExpenses.map((expense, index) => (
                  <div
                    className="flex items-center py-1.5 relative group"
                    key={index}
                  >
                    <div
                      className={`${
                        expense.expenseStatus === "Unpaid"
                          ? "bg-warning"
                          : expense.expenseStatus === "Paid"
                          ? "bg-success"
                          : expense.expenseStatus === "Invalid"
                          ? "bg-danger"
                          : "bg-primary"
                      } w-1.5 h-1.5 rounded-full mr-1`}
                    ></div>
                    <div className="flex-1">{expense.expenseDescription}</div>
                    <div className="ml-auto text-xs text-white-dark dark:text-gray-500">
                      {expense.expenseDate}
                    </div>

                    <span
                      className={`badge ${
                        expense.expenseStatus === "Unpaid"
                          ? "badge-outline-warning"
                          : expense.expenseStatus === "Paid"
                          ? "badge-outline-success"
                          : expense.expenseStatus === "Invalid"
                          ? "badge-outline-danger"
                          : "badge-outline-primary"
                      }  absolute right-0 text-xs bg-primary-light dark:bg-black opacity-0 group-hover:opacity-100 w-20 text-center`}
                    >
                      {expense.expenseStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white-light dark:border-white/10">
              <Link
                to="/expense"
                className="font-semibold group hover:text-primary p-4 flex items-center justify-center group"
              >
                View All
                <IconArrowLeft className="group-hover:translate-x-1 transition duration-300 ml-1" />
              </Link>
            </div>
          </div>

          <div className="panel h-full">
            <div className="flex items-center justify-between dark:text-white-light mb-5">
              <h5 className="font-semibold text-lg">Expense Transactions</h5>
            </div>
            <div className="h-[380px] overflow-auto">
              <div className="space-y-6 ">
                {latestExpenses.map((expense, index) => (
                  <div className="flex" key={index}>
                    <span className="shrink-0 grid place-content-center text-base w-9 h-9 rounded-md bg-success-light dark:bg-success text-success dark:text-success-light">
                      {formatName(expense.expenseDescription)}
                    </span>
                    <div className="px-3 flex-1">
                      <div>{expense.expenseDescription}</div>
                      <div className="text-xs text-white-dark dark:text-gray-500">
                        {getDate(expense.expenseDate)}
                      </div>
                    </div>
                    <span className="text-success text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">
                      &euro; {expense.expenseAmount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel h-full p-0 border-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#4361ee] to-[#160f6b] min-h-[190px]">
              <div className="flex justify-between items-center mb-6">
              </div>
              <div className="text-white flex justify-between items-center">
                <p className="text-xl">Total Purchase Orders</p>
                <h5 className="ltr:ml-auto rtl:mr-auto text-2xl">
                  <span className="text-white-light">&euro;</span>
                  {recentPoAmount}
                </h5>
              </div>
            </div>
            <div className="-mt-12 px-8 grid grid-cols-2 gap-2">
              <div className="bg-white rounded-md shadow px-4 py-2.5 dark:bg-[#060818]">
                <span className="flex justify-between items-center mb-4 dark:text-white">
                  Received
                  <IconCaretDown className="w-4 h-4 text-success rotate-180" />
                </span>
                <div className="btn w-full  py-1 text-base shadow-none border-0 bg-[#ebedf2] dark:bg-black text-[#515365] dark:text-[#bfc9d4]">
                  &euro; {recentPoPrice}
                </div>
              </div>
              <div className="bg-white rounded-md shadow px-4 py-2.5 dark:bg-[#060818]">
                <span className="flex justify-between items-center mb-4 dark:text-white">
                  Spent
                  <IconCaretDown className="w-4 h-4 text-danger" />
                </span>
                <div className="btn w-full  py-1 text-base shadow-none border-0 bg-[#ebedf2] dark:bg-black text-[#515365] dark:text-[#bfc9d4]">
                  &euro; {recentExpenses}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-5 space-y-1">
                {latestPurchaseOrder &&
                  latestPurchaseOrder.map((po) => (
                    <div className="flex items-center justify-between">
                      <p className="text-[#515365] font-semibold">
                        {po.poDescription || "-"}
                      </p>
                      <p className="text-base">
                        <span>&euro;</span>{" "}
                        <span className="font-semibold">{po.poPrice || 0}</span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div> */}

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
          <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
              <h5 className="font-semibold text-lg dark:text-white-light">
                Recent Purchase Orders
              </h5>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th className="ltr:rounded-l-md rtl:rounded-r-md">Po Id</th>
                    <th>Description</th>
                    <th>Po Amount</th>
                    <th>Invoice</th>
                    <th className="ltr:rounded-r-md rtl:rounded-l-md">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {poData &&
                    poData.map((poData) => (
                      <tr
                        key={poData.id}
                        className="text-white-dark hover:text-black dark:hover:text-white-light/90 group"
                      >
                        <td>
                          <span className="badge badge-outline-info whitespace-nowrap">
                            {formatPoId(poData.id)}
                          </span>
                        </td>
                        <td className="min-w-[150px] text-black dark:text-white">
                          <div className="flex items-center">
                            <span className="whitespace-nowrap">
                              {poData?.poDescription || "-"}
                            </span>
                          </div>
                        </td>
                        <td>{poData?.poAmount || "-"}</td>
                        <td>{poData?.poPrice || "-"}</td>
                        <td>
                        <span
                        className={`badge border ${
                          poData.poStatus === "pending"
                            ? "badge-outline-primary"
                            : poData.poStatus === "closed"
                            ? "badge-outline-success"
                            : poData.poStatus === "open"
                            ? "badge-outline-secondary"
                            : "badge-outline-danger"
                        }`}
                      >
                            {poData.poStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
              <h5 className="font-semibold text-lg dark:text-white-light">
                Recent Forecast
              </h5>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr className="border-b-0">
                    <th className="rounded-l-md rtl:rounded-r-md">
                      Forecast Id
                    </th>
                    <th>Delivery Forecast</th>
                    <th>Sales Forecast</th>
                    <th>Revenue Forecast</th>
                    <th className="rounded-r-md">Cluster</th>
                    <th className="rounded-r-md">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {data &&
                    data.map((data) => (
                      <tr
                        key={data.id}
                        className="text-white-dark hover:text-black dark:hover:text-white-light/90 group"
                      >
                        <td className="min-w-[150px] text-black dark:text-white">
                          <div className="flex">
                            <p className="whitespace-nowrap">
                              <span className="badge badge-outline-info whitespace-nowrap">
                                {formatForecastId(data.id)}
                              </span>
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          {data.deliveryForcast}
                        </td>
                        <td>{data.salesForcast}</td>
                        <td className="text-center">
                          {data.revenueForcast || "-"}
                        </td>
                        <td>{data.cluster}</td>
                        <td>{data.region}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
