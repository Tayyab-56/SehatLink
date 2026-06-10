import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Generate PDF Report for Doctors
export const generateDoctorsPDF = (doctors, stats) => {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add colorful header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 297, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Doctors Report', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
    doc.text('SehatLink Healthcare System', 250, 35, { align: 'right' });
    
    // Add stats cards
    let startY = 55;
    const statsData = [
      ['Total Doctors', stats.total.toString()],
      ['Active Doctors', stats.active.toString()],
      ['Inactive Doctors', stats.inactive.toString()],
      ['Avg Experience', `${stats.avgExperience} yrs`],
      ['Avg Rating', stats.avgRating.toFixed(1)],
      ['Total Patients', stats.totalPatients.toString()]
    ];
    
    statsData.forEach((stat, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 14 + (col * 90);
      const y = startY + (row * 22);
      
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(x, y, 85, 18, 2, 2, 'F');
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(stat[0], x + 5, y + 7);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(stat[1], x + 5, y + 15);
    });
    
    // Prepare table data
    const tableColumn = ["ID", "Name", "Specialization", "Exp", "Fee (Rs.)", "Rating", "Status", "Patients"];
    const tableRows = doctors.map(doctor => [
      doctor.id,
      `Dr. ${doctor.name}`,
      doctor.specialization || 'N/A',
      `${doctor.experience || 0}`,
      `${(doctor.fee || 0).toLocaleString()}`,
      `${doctor.rating || 0}`,
      doctor.status === 'active' ? 'Active' : 'Inactive',
      doctor.totalPatients || 0
    ]);
    
    // Add table to PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: startY + 40,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      }
    });
    
    // Add footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `SehatLink - Doctors Report | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `doctors_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`PDF Generation Failed: ${error.message}`);
  }
};

// Generate Excel Report for Doctors
export const generateDoctorsExcel = (doctors) => {
  try {
    // Prepare data for Excel
    const worksheetData = doctors.map(doctor => ({
      'Doctor ID': doctor.id,
      'Name': `Dr. ${doctor.name}`,
      'Email': doctor.email,
      'Phone': doctor.phone || 'N/A',
      'City': doctor.city || 'N/A',
      'Specialization': doctor.specialization || 'N/A',
      'Qualification': doctor.qualification || 'N/A',
      'Experience (Years)': doctor.experience || 0,
      'Consultation Fee (Rs.)': doctor.fee || 0,
      'Rating': doctor.rating || 0,
      'Status': doctor.status === 'active' ? 'Active' : 'Inactive',
      'Hospital/Clinic': doctor.hospital || 'N/A',
      'Total Appointments': doctor.totalAppointments || 0,
      'Total Patients': doctor.totalPatients || 0,
      'Total Earnings (Rs.)': doctor.totalEarnings || 0,
      'Joined Date': doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'N/A'
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 10 }, // ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // City
      { wch: 20 }, // Specialization
      { wch: 20 }, // Qualification
      { wch: 15 }, // Experience
      { wch: 18 }, // Fee
      { wch: 10 }, // Rating
      { wch: 10 }, // Status
      { wch: 25 }, // Hospital
      { wch: 18 }, // Appointments
      { wch: 15 }, // Patients
      { wch: 18 }, // Earnings
      { wch: 15 }  // Joined Date
    ];
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctors Report');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `doctors_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Generation Error:', error);
    throw new Error(`Excel Generation Failed: ${error.message}`);
  }
};