import ReactApexChart from 'react-apexcharts';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Spinner } from 'flowbite-react';
import api from '../axios';

export const PieChart = () => {

  const [regionLabel, setRegionLabel] = useState([]);
  const [regionCount, setRegionCount] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await api.get(`/analytics/getOppByregionCount`, { withCredentials: true });

        const data = res.data;
        // console.log(data);
        if (res.status === false) {
          toast.error(data.message);
        }
        else {
          setRegionLabel(data.map((item) => item.OpRegion))
          setRegionCount(data.map((item) => item.count))
        }
      }
      fetchData();

    } catch (error) {
      setError(true);
    }
  }, []);

  const pieChartOptions = {
    series: regionCount,
    options: {
      chart: {
        height: 300,
        type: 'pie',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      labels: regionLabel,
      colors: ['#4361ee', '#805dca', '#00ab55', '#ADD8E6', '#e2a03f'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
          },
        },
      ],
      stroke: {
        show: false,
      },
      legend: {
        position: 'bottom',
      },
    },
  };

  if (error) {
    return (<>
      <Spinner />
      <p>An Error occured, Please Reload the Application</p>
    </>)
  } else {
    return (
      <div className='panel h-full'>
        <div className="flex items-center mb-5">
          <h5 className="font-semibold text-lg dark:text-white-light">Opportunity Distribution</h5>
        </div>
        <div>
          <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
            <ReactApexChart
              series={pieChartOptions.series}
              options={pieChartOptions.options}
              type="pie"
              height={460}
            />
          </div>
        </div>
      </div>
    );
  }
};