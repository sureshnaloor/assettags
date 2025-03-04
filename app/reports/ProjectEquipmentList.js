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
        console.log('Fetched projects:', projects);
        setProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch equipment list when selectedProject changes
  useEffect(() => {
    console.log('selectedProject changed:', selectedProject);
    if (selectedProject) {
      fetchEquipmentList();
    }
  }, [selectedProject]);

  // Fetch equipment list when project is selected
  const fetchEquipmentList = async () => {
    if (!selectedProject) {
      console.log('No project selected, returning');
      return;
    }

    console.log('fetchEquipmentList executing for project:', selectedProject);
    const fullProjectIdentifier = `${selectedProject.wbs} - ${selectedProject.projectname}`;
    console.log('Full project identifier being sent:', fullProjectIdentifier);

    setLoading(true);
    try {
      const response = await fetch('/api/equipment/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: fullProjectIdentifier,
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

  // Handle project selection
  const handleProjectChange = (event, newValue) => {
    console.log('handleProjectChange called with:', newValue);
    setSelectedProject(newValue);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
          Project Equipment List
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          Select a project to view its equipment list
        </Typography>

        <Box sx={{ mb: 4 }}>
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

        {!loading && selectedProject && equipmentList.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            No equipment found for this project.
          </Typography>
        )}

        {equipmentList.length > 0 && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="primary">
                Equipment List for {selectedProject?.projectname}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Custody From</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentList.map((item) => (
                    <TableRow key={item._id} hover>
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
      </Paper>
    </Container>
  );
};

export default ProjectEquipmentList; 