import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Paper } from '@mui/material';
import {QRCodeSVG} from 'qrcode.react';

const QRCodePrint = () => {
  const [collection, setCollection] = useState('equipmentandtools');
  const [mode, setMode] = useState('range'); // 'range' or 'discrete'
  const [startAsset, setStartAsset] = useState('');
  const [endAsset, setEndAsset] = useState('');
  const [numberOfInputs, setNumberOfInputs] = useState(12);
  const [discreteAssets, setDiscreteAssets] = useState(Array(12).fill(''));
  const [previewData, setPreviewData] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);

  const handleDiscreteAssetChange = (index, value) => {
    const newAssets = [...discreteAssets];
    newAssets[index] = value;
    setDiscreteAssets(newAssets);
  };

  const handleNumberOfInputsChange = (value) => {
    setNumberOfInputs(value);
    setDiscreteAssets(Array(value).fill(''));
  };

  const calculateSheets = async () => {
    try {
      if (mode === 'range') {
        const response = await fetch(`/api/assets/range`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection,
            startAsset,
            endAsset,
          }),
        });
        const data = await response.json();
        setPreviewData({
          totalAssets: data.assets.length,
          sheetsRequired: Math.ceil(data.assets.length / 21),
          assets: data.assets,
        });
      } else {
        // For discrete mode, filter out empty inputs
        const filledAssets = discreteAssets.filter(asset => asset.trim() !== '');
        const assets = filledAssets.map(assetnumber => ({ assetnumber }));
        setPreviewData({
          totalAssets: assets.length,
          sheetsRequired: Math.ceil(assets.length / 21),
          assets: assets,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateQRCodes = () => {
    setQrCodes(previewData.assets);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate QR Codes for Assets
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Collection</InputLabel>
          <Select
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            label="Collection"
          >
            <MenuItem value="equipmentandtools">Equipment and Tools</MenuItem>
            <MenuItem value="fixedassets">Fixed Assets</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Input Mode</InputLabel>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            label="Input Mode"
          >
            <MenuItem value="range">Asset Range</MenuItem>
            <MenuItem value="discrete">Individual Assets</MenuItem>
          </Select>
        </FormControl>

        {mode === 'range' ? (
          <>
            <TextField
              label="Start Asset Number"
              value={startAsset}
              onChange={(e) => setStartAsset(e.target.value)}
            />
            <TextField
              label="End Asset Number"
              value={endAsset}
              onChange={(e) => setEndAsset(e.target.value)}
            />
          </>
        ) : (
          <>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Number of Inputs</InputLabel>
              <Select
                value={numberOfInputs}
                onChange={(e) => handleNumberOfInputsChange(e.target.value)}
                label="Number of Inputs"
              >
                <MenuItem value={12}>12 Assets</MenuItem>
                <MenuItem value={24}>24 Assets</MenuItem>
                <MenuItem value={36}>36 Assets</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        <Button variant="contained" onClick={calculateSheets}>
          Calculate Sheets
        </Button>
      </Box>

      {mode === 'discrete' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {discreteAssets.map((asset, index) => (
            <TextField
              key={index}
              label={`Asset ${index + 1}`}
              value={asset}
              onChange={(e) => handleDiscreteAssetChange(index, e.target.value)}
              size="small"
            />
          ))}
        </Box>
      )}

      {previewData && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography>Total Assets: {previewData.totalAssets}</Typography>
          <Typography>Sheets Required: {previewData.sheetsRequired}</Typography>
          <Button variant="contained" onClick={generateQRCodes} sx={{ mt: 2 }}>
            Generate QR Codes
          </Button>
        </Paper>
      )}

      {qrCodes.length > 0 && (
        <>
          <Button variant="contained" onClick={handlePrint} sx={{ mb: 2 }}>
            Print QR Codes
          </Button>
          <Box className="qr-sheets" sx={{ pageBreakInside: 'avoid' }}>
            {Array.from({ length: Math.ceil(qrCodes.length / 21) }).map((_, sheetIndex) => (
              <Box
                key={sheetIndex}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(7, 1fr)',
                  gap: '16px',
                  p: 3,
                  pageBreakAfter: 'always',
                  width: '210mm',  // A4 width
                  height: '297mm', // A4 height
                  margin: '0 auto',
                }}
              >
                {qrCodes.slice(sheetIndex * 21, (sheetIndex + 1) * 21).map((asset) => (
                  <Box
                    key={asset.assetnumber}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: '4px',
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '18px', fontWeight: 'bold' }}>
                      {asset.assetnumber}
                    </Typography>
                    <QRCodeSVG value={asset.assetnumber}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                    imageSettings={{
                      src: '/images/logo.jpg',
                      x: undefined,
                      y: undefined,
                      height: 48,
                      width: 48,
                    }}
                     size={120} />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default QRCodePrint;