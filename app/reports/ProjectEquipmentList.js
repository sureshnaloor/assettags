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

  const handleDownloadConsolidatedUndertaking = async () => {
    if (!selectedProject) return;
    
    try {
      const fullProjectIdentifier = `${selectedProject.wbs} - ${selectedProject.projectname}`;
      const response = await fetch(`/api/undertaking-letter-project?projectId=${encodeURIComponent(fullProjectIdentifier)}`);
      if (!response.ok) {
        throw new Error('Failed to generate consolidated project undertaking letter');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Consolidated_Project_Undertaking_Letter_${selectedProject.projectname}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading consolidated project undertaking letter:', error);
      alert('Failed to download consolidated project undertaking letter. Please try again.');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-xl font-semibold text-slate-800 dark:text-slate-200">Project Equipment List</h1>
      </div>
      
      <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm shadow-xl">
        <div className="p-6">
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Select a project to view its equipment list
        </p>

        <div className="mb-4">
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
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    '& fieldset': {
                      borderColor: 'rgb(203 213 225)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(148 163 184)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(59 130 246)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-input': {
                fontSize: '0.875rem',
              },
            }}
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && selectedProject && equipmentList.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No equipment found for this project.
          </div>
        )}

        {equipmentList.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Equipment List for {selectedProject?.projectname}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  onClick={handleDownloadConsolidatedUndertaking}
                  sx={{ 
                    px: 3,
                    py: 1,
                    fontSize: '0.875rem',
                    backgroundColor: 'rgb(34 197 94)',
                    '&:hover': {
                      backgroundColor: 'rgb(22 163 74)',
                    },
                  }}
                >
                  Download Consolidated Undertaking
                </Button>
                <Button
                  variant="contained"
                  onClick={handleExport}
                  sx={{ 
                    px: 3,
                    py: 1,
                    fontSize: '0.875rem',
                    backgroundColor: 'rgb(59 130 246)',
                    '&:hover': {
                      backgroundColor: 'rgb(37 99 235)',
                    },
                  }}
                >
                  Export to Excel
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgb(248 250 252)', '& .MuiTableCell-root': { borderColor: 'rgb(226 232 240)' } }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'rgb(71 85 105)' }}>Asset Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'rgb(71 85 105)' }}>Employee Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'rgb(71 85 105)' }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem', color: 'rgb(71 85 105)' }}>Custody From</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentList.map((item) => (
                    <TableRow key={item._id} hover sx={{ '& .MuiTableCell-root': { borderColor: 'rgb(226 232 240)', fontSize: '0.875rem' } }}>
                      <TableCell>
                        <Link 
                          href={`/asset/${item.assetnumber}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium no-underline hover:underline"
                        >
                          {item.assetnumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{item.employeenumber}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{item.employeename}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {new Date(item.custodyfrom).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEquipmentList; 