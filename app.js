// Chart Global Config
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";

// 1. Render CH4 Concentration Chart
const ch4Ctx = document.getElementById('ch4Chart').getContext('2d');

const ch4Colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899',  // pink
    '#06b6d4',  //cyan
    '#0891b2',  //teal
    '#9ca3af',  //gray
];

const ch4Datasets = dashboardData.ch4Concentration.datasets.map((ds, index) => {
    return {
        label: ds.name,
        data: ds.data,
        borderColor: ch4Colors[index % ch4Colors.length],
        backgroundColor: ch4Colors[index % ch4Colors.length] + '20',
        borderWidth: ds.name === 'เฉลี่ย Biogas' ? 3 : 2,
        borderDash: ds.name === 'เฉลี่ย Biogas' ? [5, 5] : [],
        tension: 0.4,
        fill: ds.name === 'เฉลี่ย Biogas'
    };
});

new Chart(ch4Ctx, {
    type: 'line',
    data: {
        labels: dashboardData.ch4Concentration.labels,
        datasets: ch4Datasets
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#e2e8f0' }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                min: 40,
                max: 65,
                title: { display: true, text: '% CH4', color: '#94a3b8' }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});

// Populate Extra Metrics Table
const tableBody = document.querySelector('#extraMetricsTable tbody');
if (tableBody && dashboardData.extraMetrics) {
    const metricsMap = [
        { label: 'ปริมาณน้ำเสีย m³ รวม', key: 'wastewater' },
        { label: 'ปริมาณเค้ก m³ รวม', key: 'cake' },
        { label: 'flow gas รวม (Nm³/m³)', key: 'flowGas' },
        { label: 'flow gas / ปริมาณน้ำเสีย', key: 'flowPerWastewater' }
    ];

    metricsMap.forEach(metric => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerText = metric.label;
        tr.appendChild(tdLabel);

        dashboardData.extraMetrics[metric.key].forEach(val => {
            const td = document.createElement('td');
            td.innerText = (val !== undefined && val !== null) ? val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '-';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// 2. Render Biogas Production Chart
const prodCtx = document.getElementById('productionChart').getContext('2d');

new Chart(prodCtx, {
    type: 'bar',
    data: {
        labels: dashboardData.biogasProduction.labels,
        datasets: [
            {
                label: 'ปริมาณก๊าซชีวภาพ (Nm³)',
                data: dashboardData.biogasProduction.biogasVolume,
                backgroundColor: '#3b82f680',
                borderColor: '#3b82f6',
                borderWidth: 1,
                yAxisID: 'y'
            },
            {
                label: 'น้ำเสีย & เค้ก (m³)',
                data: dashboardData.biogasProduction.wastewaterVolume,
                type: 'line',
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                borderWidth: 2,
                tension: 0.3,
                yAxisID: 'y1'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#e2e8f0' }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)'
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                title: { display: true, text: 'Biogas (Nm³)', color: '#94a3b8' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Wastewater & Cake (m³)', color: '#94a3b8' }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});


// 3. Calculator Logic
function calculateWaterYield() {
    const codIn = parseFloat(document.getElementById('codIn').value);
    const effCod = parseFloat(document.getElementById('effCod').value);
    const yieldCh4 = parseFloat(document.getElementById('yieldCh4').value); // 0.35
    const cCh4 = parseFloat(document.getElementById('cCh4').value);

    const flagCod = document.getElementById('flag-cod');

    if (isNaN(codIn)) {
        flagCod.style.display = 'block';
        document.getElementById('valWater').innerText = '-';
        return;
    } else {
        flagCod.style.display = 'none';
    }

    // Formula: (CODin * effCOD * Y_CH4) / C_CH4
    const yieldWater = (codIn * effCod * yieldCh4) / cCh4;
    document.getElementById('valWater').innerText = yieldWater.toFixed(2);
}

function calculateCakeYield() {
    const tsVal = parseFloat(document.getElementById('tsVal').value);
    const vsVal = parseFloat(document.getElementById('vsVal').value);
    const effVs = parseFloat(document.getElementById('effVs').value);
    const yieldBiogas = parseFloat(document.getElementById('yieldBiogas').value);

    const flagTs = document.getElementById('flag-ts');
    const flagVs = document.getElementById('flag-vs');

    let hasError = false;

    if (isNaN(tsVal)) {
        flagTs.style.display = 'block';
        hasError = true;
    } else {
        flagTs.style.display = 'none';
    }

    if (isNaN(vsVal)) {
        flagVs.style.display = 'block';
        hasError = true;
    } else {
        flagVs.style.display = 'none';
    }

    if (hasError) {
        document.getElementById('valCake').innerText = '-';
        return;
    }

    // Formula: 1000 * TS * VS * effVs * Y_Biogas
    const yieldCake = 1000 * tsVal * vsVal * effVs * yieldBiogas;
    document.getElementById('valCake').innerText = yieldCake.toFixed(2);
}

// Initial evaluation to show flags
calculateWaterYield();
calculateCakeYield();
