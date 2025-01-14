
// set your data here
const myConnectionMbs = 350;
const updateIntervalInMinutes = 30;

const head = document.getElementsByTagName('head')[0];
const script1 = document.createElement('script');
script1.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.3';
head.appendChild(script1);

const body = document.getElementsByTagName('body')[0];
const container = document.getElementsByClassName('speed-controls-container')[0];
const canvas = document.createElement('canvas');
canvas.id = 'chart';
container.appendChild(canvas);

let chart = null;
const ctx = document.getElementById('chart').getContext('2d');
const dataAmount = 100;

function setChart(list) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const chartObj = {
    type: 'bar',
    data: {
       labels: list.map(e => {
          if (!e.time) { return '' }
          const d = new Date(e.time);
          const day = d.getDate() < 10 ? ('0'+ d.getDate()) : d.getDate();
          const mon = d.getMonth();
          return day +'/'+ monthNames[mon].substr(0,3)
        })
        // .map(e => e.time && e.time.substring(5,16).replace("T"," "))
        .slice((list.length - dataAmount), list.length),
       datasets: [   
          {
             type: 'line',
             backgroundColor: 'rgba(0, 0, 0, 0.1)',
            // borderColor: 'rgba(0, 0, 0, 0.2)',
             data: list.map(e => myConnectionMbs).slice((list.length - dataAmount), list.length)
          },
          {
             type: 'bar',
             backgroundColor: list.map(e => getBarColor(e)).slice((list.length - dataAmount), list.length),
             borderColor: 'rgba(0, 0, 0, 1)',
             data: list.map(e => getSpeedValue(e)).slice((list.length - dataAmount), list.length)
          }
       ]
    },
    options: {
      legend: { display: false },
      elements: {
         point: { pointStyle: 'cross' }
      }
    }
  };
  if (chart) {
    chart.config = chartObj;
    chart.update();
  }
  else {
    chart = new Chart(ctx, chartObj);
  }
}

function getBarColor(bar) {
   const speedPercent = (1 / (myConnectionMbs / getSpeedValue(bar)) * 100);
   if (myConnectionMbs <= getSpeedValue(bar)) {
      return 'darkgreen';
   }
   if (speedPercent > 80) {
      return 'green';
   }
   if (speedPercent > 60) {
      return 'yellowgreen';
   }
   if (speedPercent > 40) {
      return 'orange';
   }
   if (speedPercent > 30) {
      return 'rgba(255, 0, 0, 0.5)';
   }
   return 'red';
}

function getSpeedValue(data) {
  const units = data.units || data.speed.split(' ')[1];
  const speedNumber = data.speed.replace(/[^\d.]+/g, '');
  return units && units == 'Kbps' ? ('0.'+ speedNumber) : speedNumber;
}

function init() {
  var min = 1000 * 60;
  var speed = '';
  var units = '';
  var d = new Date();
  var lsName = 'mySpeed';
  var ls = localStorage[lsName] ? JSON.parse(localStorage[lsName]) : { "history":[{"speed":"", "time":""}] };
  
  document.querySelector('.logo-container').remove();
  setChart(ls.history);
  
  setTimeout(function() {
    console.log('setting title');
    speed = document.getElementById('speed-value').innerText || '';
    units = document.getElementById('speed-units').innerText || '';
    document.querySelector('title').innerText = speed +' '+ units;
  }, min * 1);
  
  setTimeout(function() {
    console.log('setting localStorage');
    ls.history.push({"speed": speed, "units": units, "time": d });
    localStorage.setItem(lsName, JSON.stringify(ls));
    setChart(JSON.parse(localStorage[lsName]).history);
  }, min * 1);
      
  setTimeout(function() {
    window.location.reload();
  }, min * updateIntervalInMinutes);
}

setTimeout(function() {
  init();
}, 500);
