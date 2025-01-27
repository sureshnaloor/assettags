import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Paper } from '@mui/material';
import {QRCodeSVG} from 'qrcode.react';

const QRCodePrint = () => {
  const [collection, setCollection] = useState('equipmentandtools');
  const [startAsset, setStartAsset] = useState('');
  const [endAsset, setEndAsset] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);

  const calculateSheets = async () => {
    try {
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
      const totalAssets = data.assets.length;
      const sheetsRequired = Math.ceil(totalAssets / 21);

      setPreviewData({
        totalAssets,
        sheetsRequired,
        assets: data.assets,
      });
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

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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

        <Button variant="contained" onClick={calculateSheets}>
          Calculate Sheets
        </Button>
      </Box>

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
                  gap: '8px',
                  p: 1,
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
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '14px' }}>
                      {asset.assetnumber}
                    </Typography>
                    <QRCodeSVG value={asset.assetnumber} size={120} />
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