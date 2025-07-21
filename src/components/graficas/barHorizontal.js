import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const BarHorizontal = ({ xValues, yValues, title }) => {
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

    const option = useMemo(() => {
        return {
            tooltip: {
                trigger: 'item',
                textStyle: { color: textColor },
                backgroundColor: tooltipBackground,
                formatter: function (params) {
                    return `
                        <div style="font-size: 12px">
                            ${params.seriesName}<br />
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
                                    Día ${params.name}
                                </div>
                                <strong>${params.value}</strong>
                            </div>
                        </div>
                    `;
                },
            },
            grid: {
                left: 120,
                top: 0,
                bottom: 0,
            },
            xAxis: {
                type: 'value',
                show: false,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'category',
                data: xValues,
                axisLabel: {
                    color: textColor,
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(180, 180, 180, 0.2)',
                    }
                }
            },
            series: [
                {
                    name: title,
                    data: yValues,
                    type: 'bar',
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}',
                        fontSize: 12,
                        color: textColor
                    },
                }
            ]
        }
    }, [textColor, xValues, yValues, title]);

    return (
        <ReactECharts
            key={themeVersion}
            option={option}
            notMerge={true}
            style={{ height: '100%', width: '100%' }}
        />
    );
};

export default BarHorizontal;
