/* eslint-disable */

import { useEffect, useState, Fragment } from "react";
import { GraphView } from 'src/sections/overview/graphing';
import Slider from '@mui/material/Slider';

const FullLatCurve = (props) => {
    const { tcpiocp, quiciocp, tcpepoll, quicepoll, quicxdp, quicwsk, commitIndex } = props;
    const lableNames = [
        'TCP + iocp',
        'QUIC + iocp',
        'TCP + epoll',
        'QUIC + epoll',
        'QUIC + winXDP',
        'QUIC + wsk',
    ];
    const [zoom, setZoom] = useState(50);
    const [dataset, setDataset] = useState([]);
    let curve = <div />;
    useEffect(() => {
        console.log('FullLatCurve component mounted');
        const getLatCurve = async (dataset, idx) => {
            try {
                let stats_id = dataset[idx][1];
                const url = `https://raw.githubusercontent.com/microsoft/netperf/sqlite/full_latencies/full_curve_${stats_id}.json`;
                const response = await fetch(url);
                const data = await response.json();
                return data;
            } catch (err) {
                console.log(err);
                return {
                    "Values" : [],
                    "Percentiles" : []
                }
            }
        }

        const getFullCurve = async () => {
            const dataset = await Promise.all([
                getLatCurve(tcpiocp, tcpiocp.length - commitIndex - 1),
                getLatCurve(quiciocp, quiciocp.length - commitIndex - 1),
                getLatCurve(tcpepoll, tcpepoll.length - commitIndex - 1),
                getLatCurve(quicepoll, quicepoll.length - commitIndex - 1),
                getLatCurve(quicxdp, quicxdp.length - commitIndex - 1),
                getLatCurve(quicwsk, quicwsk.length - commitIndex - 1),
            ])

            setDataset(dataset);
        }

        if (tcpiocp && quiciocp && tcpepoll && quicepoll && quicxdp && quicwsk) {
            getFullCurve();
        }

    }, [tcpiocp, quiciocp, tcpepoll, quicepoll, quicxdp, quicwsk, commitIndex]);

    console.log(dataset);
    if (dataset) {
        let indices = [];
        for (let data of dataset) {
            if (data.Percentiles.length > 0) {
                indices = data.Percentiles;
                indices = indices.map((x) => x.toString());
                break;
            }
        }

        curve =  <GraphView title={`Full Curve Latency`}
            subheader={`Curve is the minimum 0th percentile of 3 runs. Data truncated to 10,000 us`}
            labels={indices}
            series={
                dataset.map((data, idx) => {
                    return {
                        name: lableNames[idx],
                        type: 'line',
                        fill: 'solid',
                        data: data.Values,
                    }
                })
            }
            options = {{
                yaxis: {
                    max:zoom*8
                },
                xaxis: {
                    tickAmount: 8,
                    labels: {
                        hideOverlappingLabels: true,
                    }
                },
            }}
            />
    }

    const handleChange = (e, newValue) => {
        setZoom(newValue);
    };

    return (
        <Fragment>
            <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" onChange={handleChange} />
            {curve}
        </Fragment>
    );
};

// Prop validation


export default FullLatCurve