import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const time = new TimeAgo('en-US');

const getFormattedTime = (datetime) => time.format(new Date(datetime));

export default getFormattedTime;
