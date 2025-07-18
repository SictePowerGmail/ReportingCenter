import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const NightingaleChart = ({ data, title }) => {
    const [textColor, setTextColor] = useState('');
    const [tooltipBackground, setTooltipBackground] = useState('');
    const [themeVersion, setThemeVersion] = useState(0);

    useEffect(() => {
        const getVariable = (name) =>
            getComputedStyle(document.documentElement).getPropertyValue(name).trim();

        const updateColors = () => {
            setTextColor(getVariable('--text'));
            setTooltipBackground(getVariable('--background-menu-cuerpo-hover'));
            setThemeVersion(prev => prev + 1);
        };

        updateColors();

        const observer = new MutationObserver(updateColors);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const option = useMemo(() => ({
        tooltip: {
            trigger: 'item',
            textStyle: { color: textColor },
            backgroundColor: tooltipBackground
        },
        legend: {
            top: 'top',
            left: 'center',
            textStyle: {
                fontSize: 12,
                color: textColor
            }
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: [30, 60],
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
                    color: textColor
                },
                data: data
            }
        ]
    }), [textColor, data, title]);

    return (
        <ReactECharts
            key={themeVersion}
            option={option}
            notMerge={true}
            style={{ height: '100%', width: '100%' }}
        />
    );
};

export default NightingaleChart;
