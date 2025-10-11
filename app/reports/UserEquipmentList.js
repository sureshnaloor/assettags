'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Container,
  Link,
} from '@mui/material';

const UserEquipmentList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const users = await response.json();
        console.log('Fetched users:', users);
        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch equipment list when selectedUser changes
  useEffect(() => {
    console.log('selectedUser changed:', selectedUser);
    if (selectedUser) {
      fetchEquipmentList();
    }
  }, [selectedUser]);

  // Fetch equipment list when user is selected
  const fetchEquipmentList = async () => {
    if (!selectedUser) {
      console.log('No user selected, returning');
      return;
    }

    console.log('fetchEquipmentList executing for user:', selectedUser);
    setLoading(true);
    try {
      const response = await fetch('/api/equipment/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeNumber: selectedUser.employeenumber,
        }),
      });
      const data = await response.json();
      console.log('API Response:', data);
      setEquipmentList(data.equipment);
    } catch (error) {
      console.error('Error fetching equipment list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserChange = (event, newValue) => {
    console.log('handleUserChange called with:', newValue);
    setSelectedUser(newValue);
  };

  // Handle export to Excel
  const handleExport = () => {
    if (equipmentList.length === 0) return;

    const csvContent = [
      ['Asset Number', 'Employee Number', 'Employee Name', 'Custody From', 'Project'],
      ...equipmentList.map(item => [
        item.assetnumber,
        item.employeenumber,
        item.employeename,
        new Date(item.custodyfrom).toLocaleDateString(),
        item.project
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_equipment_${selectedUser.employeenumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
          User Equipment List
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          Select a user to view their equipment list
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.employeenumber} - ${option.employeename}` || ''}
            value={selectedUser}
            onChange={handleUserChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select User"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Box>

        {loading && (
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Loading equipment list...
          </Typography>
        )}

        {!loading && selectedUser && equipmentList.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            No equipment found for this user.
          </Typography>
        )}

        {equipmentList.length > 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                Equipment List for {selectedUser?.employeename} ({selectedUser?.employeenumber})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                sx={{ px: 4 }}
              >
                Export to Excel
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Asset Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Custody From</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentList.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Link 
                          href={`/asset/${item.assetnumber}`}
                          sx={{ 
                            color: 'primary.main', 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {item.assetnumber}
                        </Link>
                      </TableCell>
                      <TableCell>{item.project}</TableCell>
                      <TableCell>
                        {new Date(item.custodyfrom).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default UserEquipmentList; 