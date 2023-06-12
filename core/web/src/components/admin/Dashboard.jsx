import React from 'react';

import {
  Box,
  Container,
  Grid,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';

import {
  Bar,
} from 'react-chartjs-2';

import { useAdmin } from '@providers/AdminProvider';

import styles from '@styles/_globals.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const Dashboard = () => {
  const { statistics } = useAdmin();

  return (
    <div className="Dashboard">
      <Container>
        <Grid
          container
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Grid item xs={12} md={4}>
            {!statistics
              ? <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
              : (
                <Paper
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Grid container>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>Popular topics</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Grid item>
                      {statistics.popular_topics.length !== 0
                        ? (
                          <List>
                            {statistics.popular_topics.map((topic, index) => (
                              <ListItem key={topic.title}>
                                <Typography
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: styles.font_small,
                                  }}
                                >
                                  <span>
                                    {index + 1}
                                    .
                                  </span>
                                  <Box
                                    component="img"
                                    src={topic.image}
                                    alt={topic.title}
                                    px={1}
                                    sx={{
                                      height: 24,
                                      width: 24,
                                    }}
                                  />
                                  <span>{topic.title}</span>
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography p={2} sx={{ fontSize: styles.font_small }}>
                            <span>No data</span>
                          </Typography>
                        )}
                    </Grid>
                  </Grid>
                </Paper>
              )}
          </Grid>
          <Grid item xs={12} md={4}>
            {!statistics
              ? <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
              : (
                <Paper
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Grid container>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>Preferred languages</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Grid item>
                      {statistics.preferred_languages.length !== 0
                        ? (
                          <List>
                            {statistics.preferred_languages.map((language, index) => (
                              <ListItem key={language.code}>
                                <Typography
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: styles.font_small,
                                  }}
                                >
                                  <span>
                                    {index + 1}
                                    .
                                  </span>
                                  <Box
                                    component="img"
                                    src={`${process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : ''}/static/languages/${language.code.toLowerCase()}.svg`}
                                    alt={language.name}
                                    px={1}
                                    sx={{
                                      width: 24,
                                    }}
                                  />
                                  <span>{language.name}</span>
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography p={2} sx={{ fontSize: styles.font_small }}>
                            <span>No data</span>
                          </Typography>
                        )}
                    </Grid>
                  </Grid>
                </Paper>
              )}
          </Grid>
          <Grid item xs={12} md={4}>
            {!statistics
              ? <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
              : (
                <Paper
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Grid container>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>Frequent tags</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Grid item>
                      {statistics.frequent_tags.length !== 0
                        ? (
                          <List>
                            {statistics.frequent_tags.map((tag, index) => (
                              <ListItem key={tag.name}>
                                <Typography
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: styles.font_small,
                                  }}
                                >
                                  <span>
                                    {index + 1}
                                    .
                                    {' '}
                                    {tag.name}
                                  </span>
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography p={2} sx={{ fontSize: styles.font_small }}>
                            <span>No data</span>
                          </Typography>
                        )}
                    </Grid>
                  </Grid>
                </Paper>
              )}
          </Grid>
          <Grid item xs={12} md={6}>
            {!statistics
              ? <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
              : (
                <Paper
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Grid container>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>Rooms</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Grid item p={2} sx={{ width: '100%' }}>
                      <Bar
                        options={{
                          scales: {
                            y: {
                              max: Math.max(
                                statistics.count_of_rooms,
                                statistics.count_of_active_rooms,
                              ) + 1,
                              ticks: {
                                stepSize: 1,
                              },
                            },
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  if (context.label === 'Active') {
                                    context.label += ' (room has participants)';
                                  }
                                  return context.label;
                                },
                              },
                            },
                          },
                        }}
                        data={{
                          labels: ['Total', 'Active'],
                          datasets: [
                            {
                              data: [statistics.count_of_rooms, statistics.count_of_active_rooms],
                              backgroundColor: styles.color_purple,
                            },
                          ],
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}
          </Grid>
          <Grid item xs={12} md={6}>
            {!statistics
              ? <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
              : (
                <Paper
                  sx={{
                    p: 2,
                    flexGrow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Grid container>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: styles.font_medium,
                        fontWeight: 'bold',
                      }}
                    >
                      <span>Users</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Grid item p={2} sx={{ width: '100%' }}>
                      <Bar
                        options={{
                          scales: {
                            y: {
                              max: Math.max(
                                statistics.count_of_users,
                                statistics.count_of_active_users,
                                statistics.count_of_online_users,
                                statistics.count_of_blocked_users,
                              ) + 1,
                              ticks: {
                                stepSize: 1,
                              },
                            },
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  if (context.label === 'Active') {
                                    context.label += ' (user has been online for the last 3 days or is currently online)';
                                  }
                                  return context.label;
                                },
                              },
                            },
                          },
                        }}
                        data={{
                          labels: ['Total', 'Active', 'Online', 'Blocked'],
                          datasets: [
                            {
                              data: [
                                statistics.count_of_users,
                                statistics.count_of_active_users,
                                statistics.count_of_online_users,
                                statistics.count_of_blocked_users,
                              ],
                              backgroundColor: styles.color_purple,
                            },
                          ],
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
