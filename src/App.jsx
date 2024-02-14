import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function App() {
  const [dataPeple, setDataPeple] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [year, setYear] = useState("1950");
  const [seriesData, setSeriesData] = useState([]);
  const [playSatus, setPlaySatus] = useState(false);
  const [intervalCount, setIntervalCount] = useState();

  const options = {
    chart: {
      type: "bar",
      height: 800,
    },
    title: {
      text: "Population and Demography Data",
      align: "left",
    },
    subtitle: {
      useHTML: true,
      text: `<span style="font-size: 80px">${year}</span>`,
      floating: true,
      align: "right",
      verticalAlign: "middle",
      y: -80,
      x: -100,
    },
    series: [
      {
        data: seriesData,
      },
    ],
    xAxis: {
      categories: categoriesData,
    },
    yAxis: {
      opposite: true,
      min: 0,
    },
    plotOptions: {
      series: {
        animation: false,
        groupPadding: 0,
        pointPadding: 0.1,
        borderWidth: 0,
        colorByPoint: true,
        dataSorting: {
          enabled: true,
          matchByName: true,
        },
        type: "bar",
        dataLabels: {
          enabled: true,
        },
      },
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleFilterData();
  }, [dataPeple, year]);

  const fetchData = async () => {
    try {
      const response = await fetch("../data/population-and-demography.csv");
      const text = await response.text();
      const rows = text.split("\n");
      const headers = rows[0]
        .toLowerCase()
        .split(",")
        .map((header) => header.replace(/\s+/g, "_"));
      const responseParsedData = rows.slice(1).map((row) => {
        const rowData = row.split(",");
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = rowData[index];
        });
        return obj;
      });

      setDataPeple(responseParsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilterData = () => {
    if (year >= 2021) {
      clearInterval(intervalCount);
    }
    const filterData = dataPeple.filter((item) => {
      return item.year == year;
    });

    const countrys = filterData.slice(0, 10).map((ele) => ele.country_name);
    setCategoriesData(countrys);
    let tempSeries = [];
    filterData.slice(0, 10).map((ele) => {
      const newObj = {
        name: ele.country_name,
        color: randomHexCode(),
        y: parseInt(ele.population),
      };
      tempSeries.push(newObj);
    });

    setSeriesData(tempSeries);
  };

  const randomHexCode = () => {
    var randomInt = Math.floor(Math.random() * 16777216);
    var hexCode = randomInt.toString(16).padStart(6, "0");
    return "#" + hexCode;
  };

  const handlePlay = () => {
    const interval = setInterval(() => {
      setYear((prevYear) => String(parseInt(prevYear) + 1));
    }, 500);
    setIntervalCount(interval);
  };

  const handlePause = () => {
    clearInterval(intervalCount);
  };

  return (
    <div>
      <div style={{ margin: "10px" }}>
        <figure className="highcharts-figure">
          <div id="parent-container">
            <div id="play-controls">
              <button
                id="play-pause-button"
                className={`fa fa-${playSatus ? "pause" : "play"}`}
                title="play"
                onClick={() => {
                  setPlaySatus(!playSatus);
                  if (!playSatus) {
                    handlePlay();
                  } else {
                    handlePause();
                  }
                }}
              ></button>
              <input
                id="play-range"
                type="range"
                value={year}
                min="1950"
                max="2021"
              />
            </div>
          </div>
        </figure>

        <input value={year} onChange={(e) => setYear(e.target.value)}></input>
        <button onClick={handleFilterData}>Generate Chart</button>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}

export default App;
