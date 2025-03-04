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
} from '@mui/material';

const ProjectEquipmentList = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        setProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch equipment list when project is selected
  const fetchEquipmentList = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const response = await fetch('/api/equipment/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject._id,
        }),
      });
      const data = await response.json();
      setEquipmentList(data.equipment);
    } catch (error) {
      console.error('Error fetching equipment list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle project selection
  const handleProjectChange = (event, newValue) => {
    setSelectedProject(newValue);
    if (newValue) {
      fetchEquipmentList();
    } else {
      setEquipmentList([]);
    }
  };

  // Handle export to Excel
  const handleExport = () => {
    if (equipmentList.length === 0) return;

    const csvContent = [
      ['Asset Number', 'Employee Number', 'Employee Name', 'Custody From'],
      ...equipmentList.map(item => [
        item.assetnumber,
        item.employeenumber,
        item.employeename,
        new Date(item.custodyfrom).toLocaleDateString()
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project_equipment_${selectedProject.projectname}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Project Equipment List
      </Typography>
      <h2>below is the list of equipment for the selected project</h2>

      <Box sx={{ mb: 3 }}>
        <Autocomplete
          options={projects}
          getOptionLabel={(option) => `${option.wbs} - ${option.projectname}` || ''}
          value={selectedProject}
          onChange={handleProjectChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Project"
              variant="outlined"
              sx={{ minWidth: 300 }}
            />
          )}
        />
      </Box>

      {equipmentList.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Equipment List for {selectedProject?.projectname}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
            >
              Export to Excel
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset Number</TableCell>
                  <TableCell>Employee Number</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Custody From</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentList.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.assetnumber}</TableCell>
                    <TableCell>{item.employeenumber}</TableCell>
                    <TableCell>{item.employeename}</TableCell>
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

      {loading && (
        <Typography sx={{ mt: 2 }}>Loading equipment list...</Typography>
      )}

      {!loading && selectedProject && equipmentList.length === 0 && (
        <Typography sx={{ mt: 2 }}>No equipment found for this project.</Typography>
      )}
    </Box>
  );
};

export default ProjectEquipmentList; 