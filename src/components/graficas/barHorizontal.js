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
                textStyle: {
                    color: textColor,
                    fontSize: 12
                },
                backgroundColor: tooltipBackground,
            },
            grid: {
                left: 135,
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
                    interval: 0,
                    width: 120,
                    overflow: 'break',
                    formatter: function (value) {
                        const maxLength = 20;
                        if (value.length <= maxLength) return value;

                        const lines = [];
                        let remaining = value;

                        while (remaining.length > maxLength) {
                            let sliceIndex = remaining.lastIndexOf(' ', maxLength);
                            if (sliceIndex === -1) sliceIndex = maxLength;
                            lines.push(remaining.slice(0, sliceIndex).trim());
                            remaining = remaining.slice(sliceIndex).trim();
                        }

                        if (remaining.length > 0) lines.push(remaining);
                        return lines.join('\n');
                    }
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
