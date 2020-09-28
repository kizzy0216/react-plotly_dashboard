import React, {useState, useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import createPlotlyComponent from 'react-plotly.js/factory';
import moment from "moment";
import yearData from './SampleRestaurantData_2Years';
import yesterdayData from './SampleRestaurantData_Yesterday';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

// import { faCaret } from '@fortawesome/free-solid-svg-icons'

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function App() {
    const dataRangeList = ["Yesterday", "Last 7 days", "Last 12 weeks", "Last 12 months"];
    const tabList = ["Ticket Sales", "Ticket Order Volume", "Ticket Size", "Gift Card Sales", "Gift Card Volume", "Gift Card Size"];
    const [dataRangeIndex, setDataRangeIndex] = useState(0);
    const [activeTabKey, setActiveTabKey] = useState(4);

    const [curDates, setCurDates] = useState([]);
    const [curData, setCurData] = useState([]);
    const [lastDates, setLastDates] = useState([]);
    const [lastData, setLastData] = useState([]);
    const [curDataTotalArr, setCurDataTotalArr] = useState(null);
    const [curDataTotal, setCurDataTotal] = useState(0);
    const [lastDataTotal, setLastDataTotal] = useState(0);

    const [curTexts, setCurTexts] = useState([]);
    const [lastTexts, setLastTexts] = useState([]);
    let tmpData = 0;
    let tmpDataTotal = {
        ticket_sales: 0.0,
        ticket_order_volume: 0,
        ticket_size: 0,
        gift_card_sales: 0,
        gift_card_volume: 0,
        gift_card_size: 0,
    };

    const calcTmpDataTotal = (data) => {
        tmpDataTotal.ticket_sales += data["Ticket Sales"] * 100;
        // tmpDataTotal.ticket_sales += data["Ticket Sales"];
        tmpDataTotal.ticket_order_volume += data["Ticket Order Volume"] * 100;
        tmpDataTotal.ticket_size += data["Ticket Size"] * 100;
        tmpDataTotal.gift_card_sales += data["Gift Card Sales"] * 100;
        tmpDataTotal.gift_card_volume += data["Gift Card Volume"] * 100;
        tmpDataTotal.gift_card_size += data["Gift Card Size"] * 100;
    };
    const calcTmpData = (data, flag) =>{
        if(activeTabKey === 0) // Ticket Sales
            tmpData += data["Ticket Sales"] * 100;
        else if(activeTabKey === 1) // Ticket Order Volume
            tmpData += data["Ticket Order Volume"] * 100;
        else if(activeTabKey === 2) // Ticket Size
            tmpData += data["Ticket Size"] * 100;
        else if(activeTabKey === 3) // Gift Card Sales
            tmpData += flag ? 10000 : data["Gift Card Sales"] * 100;
        else if(activeTabKey === 4) // Gift Card Volume
            tmpData += data["Gift Card Volume"] * 100;
        else if(activeTabKey === 5) // Gift Card Size
            tmpData += data["Gift Card Size"] * 100;
    };
    useEffect(() => {
        console.log('activeTabKey' + activeTabKey);
        let tmp_curDates = [], tmp_lastDates = [], tmp_curObjs = {}, tmp_lastObjs = {};
        let tmp_curData = [];
        // let tmp_lastDates = [];
        let tmp_lastData = [];
        let curBorderDate, lastBorderDate;
        if(dataRangeIndex === 3){
            curBorderDate = moment().subtract(1, 'years').add(1, 'months').set('date', 1).format('YYYY-MM-DD');
            lastBorderDate = moment().subtract(2, 'years').add(1, 'months').set('date', 1).format('YYYY-MM-DD');
        }
        else if(dataRangeIndex === 2){
            const mondayIndex = moment().day() === 0 ? -6 : 1;
            // curBorderDate = moment().subtract(1, 'weeks').day(mondayIndex);
            curBorderDate = moment().subtract(11, 'weeks').day(mondayIndex).format('YYYY-MM-DD');
            lastBorderDate = moment().subtract(23, 'weeks').day(mondayIndex).format('YYYY-MM-DD');
        }
        else if(dataRangeIndex === 1){
            curBorderDate = moment().subtract(7, 'days').add(1, 'days').format('YYYY-MM-DD');
            lastBorderDate = moment().subtract(14, 'days').add(1, 'days').format('YYYY-MM-DD');
        }
        else if(dataRangeIndex === 0){
            curBorderDate = moment().subtract(1, 'days').format('YYYY-MM-DD') + ' 00:00:00';
            // curBorderDate = moment().set({hour:0,minute:0,second:0,millisecond:0}).format('YYYY-MM-DD');
            lastBorderDate = moment().subtract(8, 'days').format('YYYY-MM-DD') + ' 00:00:00';
            // lastBorderDate = "2020-09-01";
        }
        console.log('curBorderDate', curBorderDate);
        let tmpDate;
        let tmpCurDataTotal = 0, tmpLastDataTotal = 0;
        let isFirst = 1;
        if(dataRangeIndex === 0){
            for(let data of yesterdayData){
                tmpDate = moment(data["Date"]);
                if(moment(tmpDate).isSame(moment(curBorderDate).format('YYYY-MM-DD'))){
                    calcTmpDataTotal(data);
                    calcTmpData(data);
                    tmp_curDates.push(moment(moment(curBorderDate).format('YYYY-MM-DD') + " " + data["Hour"]).format("YYYY-MM-DD HH:mm:ss"));
                    tmp_curData.push(tmpData / 100);
                    tmp_curObjs[moment(moment(curBorderDate).format('YYYY-MM-DD') + " " + data["Hour"]).format("YYYY-MM-DD HH:mm:ss")] = tmpData / 100;
                    tmpCurDataTotal += tmpData;
                    tmpData = 0;
                }
                else if(moment(tmpDate).isSame(moment(lastBorderDate).format('YYYY-MM-DD'))){
                    calcTmpData(data);
                    tmp_lastDates.push(moment(moment(curBorderDate).format('YYYY-MM-DD') + " " + data["Hour"]).format("YYYY-MM-DD HH:mm:ss"));
                    tmp_lastData.push(tmpData / 100);
                    tmp_lastObjs[moment(moment(curBorderDate).format('YYYY-MM-DD') + " " + data["Hour"]).format("YYYY-MM-DD HH:mm:ss")] = tmpData / 100;
                    tmpLastDataTotal += tmpData;
                    tmpData = 0;
                }
            }
            // setLastDates(tmp_lastDates);
        }
        else {
            for(let data of yearData){
                tmpDate = moment(data["Date"]);
                if(moment(tmpDate).isAfter(curBorderDate) || moment(tmpDate).isSame(curBorderDate)){
                    if(isFirst){
                        tmpData = 0;
                        isFirst = 0;
                    }
                    calcTmpDataTotal(data);
                    calcTmpData(data);
                    if(dataRangeIndex === 3 && (moment(tmpDate).isSame(tmpDate.endOf('month').format('YYYY-MM-DD')) || yearData.indexOf(data) === yearData.length - 1)){ // last day of month or today
                        tmp_curDates.push(moment(tmpDate).set('date', 1).format('YYYY-MM-DD'));
                        tmp_curObjs[moment(tmpDate).set('date', 1).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_curData.push(tmpData / 100);
                        tmpCurDataTotal += tmpData;
                        tmpData = 0;
                    }
                    else if(dataRangeIndex === 2 && (moment(tmpDate).day() === 0 || yearData.indexOf(data) === yearData.length - 1)){ // Sunday of current week or today
                        const mondayIndex = moment(tmpDate).day() === 0 ? -6 : 1;
                        // tmp_curDates.push(moment(tmpDate).day(mondayIndex).format('MM/DD'));
                        // tmp_curDates.push(moment(tmpDate).day(mondayIndex).format('YYYY-MM-DD'));
                        tmp_curDates.push(moment(tmpDate).day(mondayIndex).format('YYYY-MM-DD'));
                        tmp_curObjs[moment(tmpDate).day(mondayIndex).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_curData.push(tmpData / 100);
                        tmpCurDataTotal += tmpData;
                        tmpData = 0;
                    }
                    else if(dataRangeIndex === 1){ // last day of month or today
                        tmp_curDates.push(moment(tmpDate).format('YYYY-MM-DD'));
                        tmp_curObjs[moment(tmpDate).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_curData.push(tmpData / 100);
                        tmpCurDataTotal += tmpData;
                        tmpData = 0;
                    }
                }
                else if(moment(tmpDate).isAfter(lastBorderDate) || moment(tmpDate).isSame(lastBorderDate)){
                    calcTmpData(data);
                    if(dataRangeIndex === 3 && moment(tmpDate).isSame(tmpDate.endOf('month').format('YYYY-MM-DD')) ){ // last day of month or today
                        tmp_lastObjs[moment(tmpDate).set('date', 1).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_lastData.push(tmpData / 100);
                        tmpLastDataTotal += tmpData;
                        tmpData = 0;
                    }
                    else if(dataRangeIndex === 2 && moment(tmpDate).day() === 0){ // Sunday of current week or today
                        const mondayIndex = moment(tmpDate).day() === 0 ? -6 : 1;
                        tmp_lastObjs[moment(tmpDate).day(mondayIndex).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_lastData.push(tmpData / 100);
                        tmpLastDataTotal += tmpData;
                        tmpData = 0;
                    }
                    else if(dataRangeIndex === 1){ // last day of month or today
                        tmp_lastObjs[moment(tmpDate).format('YYYY-MM-DD')] = tmpData / 100;
                        tmp_lastData.push(tmpData / 100);
                        tmpLastDataTotal += tmpData;
                        tmpData = 0;
                    }
                }
            }
        }
        console.log('tmp_curDates', tmp_curDates);
        console.log('tmp_curObjs', tmp_curObjs);
        // for(let iDate = curBorderDate; moment(iDate).isAfter(moment()) === false;iDate = moment(iDate).add(7200000).format('YYYY-MM-DD HH:mm:ss')){
        const nextDayZero = dataRangeIndex === 0 ? moment().set({hour:0,minute:0,second:0,millisecond:0}) : moment().set({hour:23,minute:59,second:59,millisecond:0});
        // for(let iDate = curBorderDate; moment(iDate).isAfter(nextDayZero) === false;iDate = moment(iDate).add(86400000).format('YYYY-MM-DD HH:mm:ss')){
        let iDate = curBorderDate;
        while(moment(iDate).isAfter(nextDayZero) === false){
            console.log('iDate ', iDate, iDate in tmp_curObjs);
            if(!(iDate in tmp_curObjs)){
                if(dataRangeIndex === 0)
                    tmp_curObjs[iDate] = 0;
                else
                    tmp_curObjs[moment(iDate).format('YYYY-MM-DD')] = 0;
            }
            if(dataRangeIndex === 0 && !(iDate in tmp_lastObjs)){
                if(dataRangeIndex === 0)
                    tmp_lastObjs[iDate] = 0;
                else
                    tmp_lastObjs[moment(iDate).format('YYYY-MM-DD')] = 0;
            }
            // iDate = moment(iDate).add(86400000).format('YYYY-MM-DD HH:mm:ss');

            if(dataRangeIndex === 0)
                iDate = moment(iDate).add(7200000).format('YYYY-MM-DD HH:mm:ss');
            else if(dataRangeIndex === 1)
                iDate = moment(iDate).add(86400000).format('YYYY-MM-DD');
            else if(dataRangeIndex === 2)
                iDate = moment(iDate).add(1, 'weeks').format('YYYY-MM-DD');
            else if(dataRangeIndex === 3)
                iDate = moment(iDate).add(1, 'months').format('YYYY-MM-DD');
        }
        console.log('tmp_curObjs', tmp_curObjs);
        let orderedCurDates = {}, orderedLastDates = {};
        Object.keys(tmp_curObjs).sort(function(a, b) {
            return moment(a, 'YYYY-MM-DD HH:mm:ss').toDate() - moment(b, 'YYYY-MM-DD HH:mm:ss').toDate();
        }).forEach(function(key) {
            orderedCurDates[key] = tmp_curObjs[key];
        });
        console.log('orderedCurDates', Object.keys(orderedCurDates), Object.values(orderedCurDates));

        Object.keys(tmp_lastObjs).sort(function(a, b) {
            return moment(a, 'YYYY-MM-DD HH:mm:ss').toDate() - moment(b, 'YYYY-MM-DD HH:mm:ss').toDate();
        }).forEach(function(key) {
            orderedLastDates[key] = tmp_lastObjs[key];
        });

        setCurDataTotalArr([`($${numberWithCommas(tmpDataTotal.ticket_sales / 100)})`, `(${numberWithCommas(tmpDataTotal.ticket_order_volume / 100)})`, `($${numberWithCommas(tmpDataTotal.ticket_size / 100)})`,
            `($${numberWithCommas(tmpDataTotal.gift_card_sales / 100)})`, `(${numberWithCommas(tmpDataTotal.gift_card_volume / 100)})`, `($${numberWithCommas(tmpDataTotal.gift_card_size / 100)})`]);
        console.log('curdates', Object.keys(orderedCurDates));
        console.log('lastdates', Object.keys(orderedLastDates));
        setCurDates(Object.keys(orderedCurDates));
        setCurData(Object.values(orderedCurDates));
        setLastDates(Object.keys(orderedLastDates));
        setLastData(Object.values(orderedLastDates));
        let tmpCurTexts = [], tmpLastTexts = [];
        const unitStr = [0, 2, 3, 5].indexOf(activeTabKey) !== -1? '$' : '';
        for(const property in orderedCurDates){
            if(orderedCurDates.hasOwnProperty(property)) {
                if (dataRangeIndex === 0) {
                    let lastProperty = property;
                    let trend = 0;
                    if (lastProperty in orderedLastDates && orderedLastDates[lastProperty] !== 0) {
                        trend = ((orderedCurDates[property] - orderedLastDates[lastProperty]) * 100 / orderedLastDates[lastProperty]).toFixed(2);
                    }
                    const trendHtml = trend === 0 ? '' : `<span style="color: ${trend > 0 ? 'rgb(39,120,80)' : 'rgb(220,55,51)'}">${trend}% <i style="font-family: FontAwesome; font-size: 16px" class="fa">&#xf0d8;</i></span>`;
                    tmpCurTexts.push(`<span>${moment(lastProperty).format("M/D HH:mm")}                </span>${trendHtml}   <span>${unitStr + numberWithCommas(orderedCurDates[property])}</span>`);
                } else {
                    let lastProperty,dateFormat;
                    if (dataRangeIndex === 1){
                        lastProperty = moment(property).subtract(1, 'weeks').format('YYYY-MM-DD');
                        dateFormat = "ddd M/D";
                    }
                    else if (dataRangeIndex === 2) {
                        lastProperty = moment(property).subtract(12, 'weeks').format('YYYY-MM-DD');
                        dateFormat = "ddd M/D";
                    } else if (dataRangeIndex === 3){
                        lastProperty = moment(property).subtract(1, 'years').format('YYYY-MM-DD');
                        dateFormat = "MMM YYYY";
                    }

                    let trend = 0;
                    if (lastProperty in orderedLastDates && orderedLastDates[lastProperty] !== 0) {
                        trend = ((orderedCurDates[property] - orderedLastDates[lastProperty]) * 100 / orderedLastDates[lastProperty]).toFixed(2);
                    }
                    const trendHtml = trend === 0 ? null : `<span style="color: ${trend > 0 ? 'rgb(39,120,80)' : 'rgb(220,55,51)'}">${trend}% <i style="font-family: FontAwesome; font-size: 16px" class="fa">&#xf0d8;</i></span>`;
                    tmpCurTexts.push(`<span>${moment(property).format(dateFormat)}                </span>${trendHtml}   <span>${numberWithCommas(unitStr + orderedCurDates[property])}</span>`);
                    if (lastProperty in orderedLastDates)
                        tmpLastTexts.push(`<span>${moment(lastProperty).format(dateFormat)}                </span><span style="visibility: hidden">${trendHtml}</span>   <span>${unitStr + numberWithCommas(orderedLastDates[lastProperty])}</span>`);
                }
            }
        }
        if (dataRangeIndex === 0) {

            for(const property in orderedLastDates) {
                if (orderedLastDates.hasOwnProperty(property)) {
                    let trend = 0;
                    if (property in orderedCurDates && orderedLastDates[property] !== 0) {
                        trend = ((orderedCurDates[property] - orderedLastDates[property]) * 100 / orderedLastDates[property]).toFixed(2);
                    }
                    const trendHtml = trend === 0 ? '' : `<span style="color: ${trend > 0 ? 'rgb(39,120,80)' : 'rgb(220,55,51)'}">${trend}% <i style="font-family: FontAwesome; font-size: 16px" class="fa">&#xf0d8;</i></span>`;
                    tmpLastTexts.push(`<span>${moment(property).subtract(7, 'days').format("M/D HH:mm")}                </span><span style="visibility: hidden">${trendHtml}</span>   <span>${unitStr + numberWithCommas(orderedLastDates[property])}</span>`);
                }
            }
        }
        setCurTexts(tmpCurTexts);
        setLastTexts(tmpLastTexts);
        // setCurDates(tmp_curDates);
        // setCurData(tmp_curData);
        // setLastData(tmp_lastData);
        setCurDataTotal(tmpCurDataTotal / 100);
        setLastDataTotal(tmpLastDataTotal / 100);
    }, [activeTabKey, dataRangeIndex]);
    return (
        <Container className="pt-5">
            <Dropdown>
                <Dropdown.Toggle variant="dark rounded-pill" id="dropdown-data-range">
                    {dataRangeList[dataRangeIndex]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        dataRangeList.map((dataRange, i) => (
                            <Dropdown.Item onClick={() => setDataRangeIndex(i)} key={i}>{dataRange}</Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
            <div className="mt-lg-5">
                <Tabs defaultActiveKey={activeTabKey} id="uncontrolled-tab-example" className="border-bottomed-tab" onSelect={(key) => setActiveTabKey(parseInt(key))}>
                    {
                        tabList.map((tabText, i) => (
                            <Tab eventKey={i} title={tabText + (curDataTotalArr != null ? curDataTotalArr[i] : '')}>
                                {/*<div>{i}</div>*/}
                                <Chart dataRangeIndex={dataRangeIndex} activeTabKey={activeTabKey} propCurDates={curDates} propLastDates={lastDates} propCurData={curData} propLastData={lastData}
                                       propCurDataTotal={curDataTotal} propLastDataTotal={lastDataTotal} propCurTexts={curTexts} propLastTexts={lastTexts}/>
                            </Tab>
                        ))
                    }
                </Tabs>
            </div>
        </Container>
    );
}

function Chart({dataRangeIndex, activeTabKey, propCurDates, propCurData, propLastDates, propLastData, propCurDataTotal, propLastDataTotal, propCurTexts, propLastTexts}){
    const [curDates, setCurDates] = useState([]);
    const [curData, setCurData] = useState([]);
    const [lastDates, setLastDates] = useState([]);
    const [lastData, setLastData] = useState([]);

    const [curDataTotal, setCurDataTotal] = useState(0);
    const [lastDataTotal, setLastDataTotal] = useState(0);
    const [curDataLabel, setCurDataLabel] = useState('Last 12 months');
    const [lastDataLabel, setLastDataLabel] = useState('Last 12-24 months');
    const [tickFormat, setTickFormat] = useState('%m/%D'); // Date Time Format in X-Axis
    const [dtick, setDtick] = useState(604800000); // Distance between datetime values in X-Axis


    const [curTexts, setCurTexts] = useState([]);
    const [lastTexts, setLastTexts] = useState([]);
    let hoverInfo;
    useEffect(() => {
        setCurDates(propCurDates);
        setCurData(propCurData);
        setLastDates(propLastDates);
        setLastData(propLastData);
        setCurDataTotal(propCurDataTotal);
        setLastDataTotal(propLastDataTotal);
        setCurTexts(propCurTexts);
        setLastTexts(propLastTexts);
        // console.log(propCurDates);
        // console.log(propCurData);
        // console.log(propLastData);
        if(dataRangeIndex === 3){
            setCurDataLabel('Last 12 months');
            setLastDataLabel('Last 12-24 months');
            // setTickFormat('%b %Y');
            setTickFormat('%b');
            setDtick('M1');
        } else if (dataRangeIndex === 2){
            setCurDataLabel('Last 12 weeks');
            setLastDataLabel('Last 12-24 weeks');
            setTickFormat('%m/%d');
            setDtick(604800000);
        } else if (dataRangeIndex === 1){
            setCurDataLabel('Last 7 days');
            setLastDataLabel('Last 7-14 days');
            setTickFormat('%a %m/%d'); // weekday month/date
            setDtick(86400000);
        } else if (dataRangeIndex === 0){
            setCurDataLabel(moment().subtract(1, 'days').format('ddd M/D'));
            setLastDataLabel(moment().subtract(8, 'days').format('ddd M/D'));
            // setTickFormat("%m %d %I %p"); // weekday month/date
            setTickFormat("%I %p"); // weekday month/date
            setDtick(7200000);
        }
    }, [dataRangeIndex, activeTabKey, propCurDates, propCurData, propLastDates, propLastData, propCurDataTotal, propLastDataTotal, propCurTexts, propLastTexts]);
    const onHover = (data) => {
        // console.log('onHover', data);
        // hoverInfo.innerHTML = 'Hover';
    };
    const trendPercent = lastDataTotal != 0 ?parseInt((curDataTotal - lastDataTotal ) / lastDataTotal * 100) : 0;
    return (
        <div className="p-3">
            <div className="p-2 d-flex" style={{justifyContent: 'space-between', alignItems:'center'}}>
                <div className="d-flex">
                    <div className="pr-3">
                        <h3>{[0, 2, 3, 5].indexOf(activeTabKey) !== -1 ? '$' : ''}{numberWithCommas(curDataTotal)}</h3>
                        <h5 style={{marginBottom: 0}}>{curDataLabel}</h5>
                        <svg style={{width: '100px', height: '14px'}}>
                            <g className="traces" transform="translate(0, 7)">
                                <g className="layers" style={{opacity: 1}}>
                                    <g className="legendfill"></g>
                                    <g className="legendlines">
                                        <path className="js-line" d="M5,0h30"
                                              style={{fill: 'none', stroke: 'rgb(38, 106, 205)', strokeOpacity: 1, strokeWidth: '2px'}}/>
                                    </g>
                                    <g className="legendsymbols">
                                        <g className="legendpoints">
                                            <path className="scatterpts" transform="translate(20,0)"
                                                  d="M6,0A6,6 0 1,1 0,-6A6,6 0 0,1 6,0Z"
                                                  style={{opacity: 1, strokeWidth: '0px', fill: 'rgb(38, 106, 205)', fillOpacity: 1}}/>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div>
                        <h3>{[0, 2, 3, 5].indexOf(activeTabKey) !== -1 ? '$' : ''}{numberWithCommas(lastDataTotal)}</h3>
                        <h5 style={{marginBottom: 0}}>{lastDataLabel}</h5>
                        <svg style={{width: '100px', height: '14px'}}>
                            <g className="traces" transform="translate(0, 7)">
                                <g className="layers" style={{opacity: 1}}>
                                    <g className="legendfill"></g>
                                    <g className="legendlines">
                                        <path className="js-line" d="M5,0h30"
                                              style={{fill: 'none', stroke: 'rgb(38, 106, 205)', strokeOpacity: 1, strokeWidth: '2px'}}/>
                                    </g>
                                    <g className="legendsymbols">
                                        <g className="legendpoints">
                                            <path className="scatterpts" transform="translate(20,0)"
                                                  d="M5,0A5,5 0 1,1 0,-5A5,5 0 0,1 5,0Z"
                                                  style={{opacity: 1, strokeWidth: '2px', fill: 'rgb(255, 255, 255)', fillOpacity: 1, stroke: 'rgb(38, 106, 205)', strokeOpacity: 1}}/>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
                <div style={{display: lastDataTotal ? 'block' : 'none'}}>
                    <div className={`trendBadge ${trendPercent > 0 ? 'up' : 'down'} p-1`}>
                        <span>{trendPercent}%</span>
                        {/*<FontAwesomeIcon icon="coffee" />*/}
                        <span className="pl-2">
                            <FontAwesomeIcon icon={trendPercent > 0 ? faCaretUp : faCaretDown} />
                        </span>
                    </div>
                </div>
            </div>
            <Plot
                style={{width: '100%'}}
                onHover={onHover}
                data={[
                    {
                        'x': curDates,
                        'y': curData,
                        // mode: 'lines',
                        mode: 'lines+markers',
                        name: curDataLabel,
                        marker: {
                            color: 'rgb(38, 106, 205)',
                            size: 12,
                        },
                        // hovertemplate: '<span style="color: black">Price:  $%{y:.2f}</span>',
                        text: curTexts,
                        hoverinfo: 'text'
                    },
                    {
                        'x': dataRangeIndex === 0 ? lastDates : curDates,
                        'y': lastData,
                        mode: 'lines+markers',
                        name: lastDataLabel,
                        type: 'scatter',
                        line: {
                            dash: 'dash',
                            // shape: 'spline',
                            color: 'rgb(38, 106, 205)',
                            width: 2
                        },
                        marker: {
                            color: 'white',
                            size: 10,
                            line: {
                                color: 'rgb(38, 106, 205)',
                                width: 2
                            }
                        },
                        // hovertemplate: `$%{y:.2f}`
                        text: lastTexts,
                        hoverinfo: 'text'
                    }
                ]}
                useResizeHandler
                layout={{
                    autosize: true,
                    xaxis:{
                        spikedash: 'solid',
                        spikemode: 'across',
                        spikecolor: 'rgb(50,50,50)',
                        tick0: dataRangeIndex === 0 ? "2020-09-08 00:00:00" : curDates[curDates.length - 1],
                        tickformat: tickFormat,
                        dtick: dtick,
                    },
                    yaxis:{
                        zeroline: true
                    },
                    hovermode: 'x unified',
                    hoverinfo: 'none',
                    hoverlabel: {
                        bordercolor: 'rgb(180,180,180)',
                        // align: 'auto'
                    },
                    showlegend: false
                }}
                responsive={true}
            />
            <div style={{width:'1000px', height: '1000px'}}>
            </div>
            <div id='hoverInfo' ref={ (el) => hoverInfo = el }>
            </div>
        </div>
    )
}

export default App;
