import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

const ResultsWindow = ({ images, tables, summaryHtml, queryId, sessionId, onDetailsClick, onAnnualDetailsClick, isAdmin, onAdminClick }) => {
  const theme = useTheme();
  const [inputsExpanded, setInputsExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [summaryTruncated, setSummaryTruncated] = useState(true);
  const [chartsExpanded, setChartsExpanded] = useState(true);

  useEffect(() => { setSummaryTruncated(true); }, [summaryHtml]);
  const hasContent = (images && images.length > 0) || (tables && tables.length > 0) || summaryHtml;

  if (!hasContent) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Results will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Results
      </Typography>

      {/* Tables Section */}
      {tables && tables.length > 0 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: inputsExpanded ? 2 : 0,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setInputsExpanded(!inputsExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Inputs and Assumptions
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              {inputsExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          {/* Group tables by rowGroup */}
          {inputsExpanded && (() => {
            const renderTable = (table, key) => (
              <Paper
                key={key}
                elevation={1}
                sx={{ flex: table.sideBySide ? 1 : undefined, p: 1.5, overflow: 'auto' }}
              >
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {table.title}
                </Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr>
                      {table.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            borderBottom: `2px solid ${theme.palette.secondary.main}`,
                            padding: 4,
                            textAlign: 'left',
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            style={{
                              padding: 4,
                              textAlign: j === 0 ? 'left' : 'right',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            );

            // Group tables by rowGroup property
            const grouped = tables.reduce((acc, table, idx) => {
              const group = table.rowGroup !== undefined ? table.rowGroup : idx;
              if (!acc[group]) acc[group] = [];
              acc[group].push({ table, idx });
              return acc;
            }, {});

            return (
              <>
                {Object.keys(grouped).map(groupKey => {
                  const groupTables = grouped[groupKey];
                  const hasSideBySide = groupTables.some(({ table }) => table.sideBySide);

                  if (hasSideBySide) {
                    return (
                      <Box key={`group-${groupKey}`} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {groupTables.map(({ table, idx }) => renderTable(table, `table-${idx}`))}
                      </Box>
                    );
                  } else {
                    return groupTables.map(({ table, idx }) => (
                      <Box key={`group-${groupKey}-${idx}`} sx={{ mb: 2 }}>
                        {renderTable(table, `table-${idx}`)}
                      </Box>
                    ));
                  }
                })}
              </>
            );
          })()}
        </Box>
      )}

      {/* Summary Section */}
      {summaryHtml && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: summaryExpanded ? 2 : 0,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setSummaryExpanded(!summaryExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Summary
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              {summaryExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          {summaryExpanded && (() => {
            const lines = summaryHtml.split('\n');
            const needsTruncation = lines.length > 20;
            const visibleText = needsTruncation && summaryTruncated
              ? lines.slice(0, 20).join('\n')
              : summaryHtml;
            return (
              <Paper elevation={1} sx={{ p: 1.5, overflow: 'auto' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre', fontFamily: 'monospace', fontSize: '0.6875rem' }}>
                  {visibleText}
                </pre>
                {needsTruncation && (
                  <Box
                    component="span"
                    onClick={() => setSummaryTruncated(!summaryTruncated)}
                    sx={{
                      display: 'inline-block',
                      mt: 0.5,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.palette.secondary.main,
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.secondary.dark },
                    }}
                  >
                    {summaryTruncated ? 'More...' : 'Less...'}
                  </Box>
                )}
              </Paper>
            );
          })()}
        </Box>
      )}

      {/* Charts and Tables Section */}
      {images && images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: chartsExpanded ? 2 : 0,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setChartsExpanded(!chartsExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Charts and Tables
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              {chartsExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          {chartsExpanded && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
            {images.map((img, idx) => (
              <Paper
                key={idx}
                elevation={1}
                sx={{
                  flex: '1 1 calc(50% - 4px)',
                  minWidth: 250,
                  p: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {img.alt}
                  </Typography>
                  {img.alt === 'Flows Chart' && (
                    <Box
                      component="a"
                      href="/Explanation.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        color: theme.palette.secondary.main,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': { color: theme.palette.secondary.dark },
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.65rem',
                          fontStyle: 'italic',
                        }}
                      >
                        How do I use this chart?
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    }
                  }}
                  onClick={() => window.open(img.src, '_blank')}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Chart ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </Box>
                {img.thumbnail && (
                  <>
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                      {img.detailsLink ? 'Monthly Details' : 'Annual Details'}
                    </Typography>
                    <Box
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                      onClick={() => {
                        if (img.detailsLink && onDetailsClick) {
                          onDetailsClick(img.detailsLink);
                        } else if (img.annualDetailsLink && onAnnualDetailsClick) {
                          onAnnualDetailsClick();
                        }
                      }}
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.detailsLink ? 'Monthly Details' : 'Annual Details'}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </>
                )}
              </Paper>
            ))}
          </Box>
          )}
        </Box>
      )}

      {/* Query ID at bottom */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        {queryId && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontStyle: 'italic',
              fontSize: '0.8rem',
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.action.hover,
              p: 1,
              textAlign: 'center'
            }}
          >
            Query ID:{' '}
            {isAdmin && onAdminClick ? (
              <Box
                component="span"
                onClick={() => onAdminClick(sessionId, queryId)}
                sx={{
                  color: theme.palette.secondary.main,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.secondary.dark },
                }}
              >
                {queryId}
              </Box>
            ) : (
              queryId
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResultsWindow;
