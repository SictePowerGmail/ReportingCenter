import React from 'react';
import ReactECharts from 'echarts-for-react';

const NightingaleChart = ({ data, title }) => {
    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: 'top',
            left: 'center',
            textStyle: {
                fontSize: 12
            }
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: [30, 70],
                center: ['50%', '60%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: {d}%',
                    fontSize: 12,
                },
                data: data,
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default NightingaleChart;
