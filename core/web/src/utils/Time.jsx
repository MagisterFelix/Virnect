import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const time = new TimeAgo('en-GB');

const getFormattedTime = (datetime) => time.format(new Date(datetime));

const getFormattedDateTime = (datetime) => {
  const currentDay = new Date().getDate() === new Date(datetime).getDate();
  const currentYear = new Date().getFullYear() === new Date(datetime).getFullYear();
  if (currentDay) {
    return new Date(datetime).toLocaleTimeString('en-GB', { timeStyle: 'short', hour12: false });
  }
  if (currentYear) {
    return new Date(datetime).toLocaleString(
      'en-GB',
      {
        day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric',
      },
    ).replace(/\//g, '.');
  }
  return new Date(datetime).toLocaleString(
    'en-GB',
    {
      day: 'numeric', month: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric',
    },
  ).replace(/\//g, '.');
};

export {
  getFormattedTime, getFormattedDateTime,
};
