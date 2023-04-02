import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const time = new TimeAgo('en-US');

const getFormattedTime = (datetime) => {
  const datetimeTZ = new Date(new Date(datetime) - new Date().getTimezoneOffset() * 60000);
  return time.format(datetimeTZ);
};

export default getFormattedTime;
