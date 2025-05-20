let summarySortState = {
  key: null,
  ascending: true
};


function getFilteredSessions(filterFunc) {
  return sessions.filter(filterFunc).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// function renderAttendance() {
//   const classVal = document.getElementById('filterClass').value;
//   const nameVal = document.getElementById('filterName').value;
//   const dateVal = document.getElementById('filterDate').value;

//   const rows = [];
//   const summary = {};

//   getFilteredSessions(s => {
//     return (!classVal || s.class === classVal) &&
//       (!dateVal || s.date === dateVal);
//   }).forEach(session => {
//     session.attendance.forEach(record => {
//       if (!nameVal || record.studentName === nameVal) {
//         const symbol = record.present
//           ? '<span class="present">✓</span>'
//           : '<span class="absent">✗</span>';
//         rows.push(`<tr><td>${session.date}</td><td>${session.class}</td><td>${record.studentName}</td><td>${symbol}</td></tr>`);

//         const name = record.studentName;
//         if (!summary[name]) summary[name] = { total: 0, present: 0 };
//         summary[name].total++;
//         if (record.present) summary[name].present++;
//       }
//     });
//   });

//   document.querySelector('#attendanceTable tbody').innerHTML = rows.join("");

//   const summaryRows = Object.entries(summary).map(([name, { total, present }]) => {
//     const percent = ((present / total) * 100).toFixed(1);
//     return `<tr><td>${name}</td><td>${total}</td><td>${present}</td><td>${percent}%</td></tr>`;
//   });

//   document.querySelector('#summaryTable tbody').innerHTML = summaryRows.join("");
//   updateStudentOptions('filterName', classVal);
// }

function renderAttendance() {
  const classVal = document.getElementById('filterClass').value;
  const nameVal = document.getElementById('filterName').value;
  const dateFrom = document.getElementById('filterDateFrom').value;
  const dateTo = document.getElementById('filterDateTo').value;

  const rows = [];
  const summary = {};

  getFilteredSessions(s => {
    const sessionDate = new Date(s.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return (!classVal || s.class === classVal) &&
      (!from || sessionDate >= from) &&
      (!to || sessionDate <= to);
  }).forEach(session => {
    session.attendance.forEach(record => {
      if (!nameVal || record.studentName === nameVal) {
        // rows.push(`<tr><td>${session.date}</td><td>${session.class}</td><td>${record.studentName}</td><td class="${record.present ? 'present' : 'absent'}">${record.present ? "✓" : "✗"}</td></tr>`);
        rows.push(`
  <tr>
    <td data-label="Date">${session.date}</td>
    <td data-label="Class">${session.class}</td>
    <td data-label="Student">${record.studentName}</td>
    <td data-label="Present" class="${record.present ? 'present' : 'absent'}">
      ${record.present ? "✓" : "✗"}
    </td>
  </tr>
`);

        const name = record.studentName;
        if (!summary[name]) summary[name] = { total: 0, present: 0 };
        summary[name].total++;
        if (record.present) summary[name].present++;
      }
    });
  });

  document.querySelector('#attendanceTable tbody').innerHTML = rows.join("");

  const summaryRows = Object.entries(summary).map(([name, { total, present }]) => {
    const percent = ((present / total) * 100).toFixed(1);
    return `<tr><td>${name}</td><td>${total}</td><td>${present}</td><td>${percent}%</td></tr>`;
  });

  const summaryTable = document.querySelector('#summaryTable tbody');
  if (summaryTable) {
    summaryTable.innerHTML = summaryRows.join("");
  }

  updateStudentOptions('filterName', classVal);
}


function renderTaught() {
  const classVal = document.getElementById('filterClassTaught').value;
  const unitVal = document.getElementById('filterUnit').value;
  const dateVal = document.getElementById('filterDateTaught').value;

  const rows = getFilteredSessions(s => {
    return (!classVal || s.class === classVal) &&
      (!unitVal || s.unit === unitVal) &&
      (!dateVal || s.date === dateVal);
  }).map(s => {
    // return `<tr><td>${s.date}</td><td>${s.class}</td><td>${s.unit}</td><td>${s.exercise}</td><td class="left-align">${s.taughtAmount}</td><td class="left-align">${s.homework}</td><td>${s.remarks}</td></tr>`;
    return `
  <tr>
    <td data-label="Date">${s.date}</td>
    <td data-label="Class">${s.class}</td>
    <td data-label="Unit">${s.unit}</td>
    <td data-label="Exercise">${s.exercise}</td>
    <td data-label="Topics Covered (Classwork done)">${s.taughtAmount}</td>
    <td data-label="Homework">${s.homework}</td>
    <td data-label="Remarks">${s.remarks}</td>
  </tr>
`;

  });

  document.querySelector('#taughtTable tbody').innerHTML = rows.join("");
}

function renderStudentView() {
  const classVal = document.getElementById('filterClassStudent').value;
  const nameVal = document.getElementById('filterNameStudent').value;

  const rows = getFilteredSessions(s => !classVal || s.class === classVal)
    .flatMap(session => {
      const student = session.attendance.find(a => a.studentName === nameVal);
      if (!student) return [];
      const symbol = student.present
        ? '<span class="present">✓</span>'
        : '<span class="absent">✗</span>';
      // return `<tr><td>${session.date}</td><td>${session.class}</td><td>${student.studentName}</td><td>${symbol}</td><td>${session.taughtAmount}</td><td>${session.homework}</td></tr>`;
      return `
  <tr>
    <td data-label="Date">${session.date}</td>
    <td data-label="Class">${session.class}</td>
    <td data-label="Student">${student.studentName}</td>
    <td data-label="Present">${symbol}</td>
    <td data-label="Taught">${session.taughtAmount}</td>
    <td data-label="Homework">${session.homework}</td>
  </tr>
`;

    });

  document.querySelector('#studentTable tbody').innerHTML = rows.join("");
}

function updateClassOptions(selectId) {
  const classes = [...new Set(sessions.map(s => s.class))];
  const options = ['<option value="">All Classes</option>'].concat(classes.map(c => `<option value="${c}">${c}</option>`));
  document.getElementById(selectId).innerHTML = options.join("");
}

function updateUnitOptions(selectId) {
  const units = [...new Set(sessions.map(s => s.unit))];
  const options = ['<option value="">All Units</option>'].concat(units.map(u => `<option value="${u}">${u}</option>`));
  document.getElementById(selectId).innerHTML = options.join("");
}

function updateStudentOptions(selectId, className) {
  const names = [...new Set(sessions.filter(s => s.class === className)
    .flatMap(s => s.attendance.map(a => a.studentName)))];
  const options = ['<option value="">All Students</option>'].concat(names.map(n => `<option value="${n}">${n}</option>`));
  document.getElementById(selectId).innerHTML = options.join("");
}


// function renderSummary() {
//   const classVal = document.getElementById('filterClassSummary').value;
//   const sessionsForClass = sessions.filter(s => !classVal || s.class === classVal);
//   const totalDays = [...new Set(sessionsForClass.map(s => s.date))].length;

//   const summary = {};

//   sessionsForClass.forEach(session => {
//     session.attendance.forEach(({ studentName, present }) => {
//       if (!summary[studentName]) summary[studentName] = { present: 0 };
//       if (present) summary[studentName].present++;
//     });
//   });


//   const sortedEntries = Object.entries(summary).sort(([aName, aVal], [bName, bVal]) => {
//     if (summarySortState.key === 'percent') {
//       const aPct = (aVal.present / totalDays);
//       const bPct = (bVal.present / totalDays);
//       return summarySortState.ascending ? aPct - bPct : bPct - aPct;
//     } else if (summarySortState.key === 'name') {
//       return summarySortState.ascending
//         ? aName.localeCompare(bName)
//         : bName.localeCompare(aName);
//     }
//     return 0; // No sorting
//   });

//   const summaryRows = sortedEntries.map(([name, { present }]) => {
//     const percent = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : "0.0";
//     return `<tr><td>${name}</td><td>${totalDays}</td><td>${present}</td><td>${percent}%</td></tr>`;
//   });
//   //modified till here



//   document.querySelector('#summaryTable tbody').innerHTML = summaryRows.join("");
//   updateClassOptions('filterClassSummary');

// }

let filteredSummaryData = []; // keep track of current filtered data

/*
function renderAttendanceSummary() {
  const classVal = document.getElementById('filterClassSummary').value;

  // const allDates = [...new Set(sessions.map(s => s.date))];
  // const totalDays = allDates.length;

  //the two line of code modified to:
  const filteredSessions = getFilteredSessions(s => !classVal || s.class === classVal);
  const allDates = [...new Set(filteredSessions.map(s => s.date))];
  const totalDays = allDates.length;

  const summary = {};

  getFilteredSessions(s => !classVal || s.class === classVal).forEach(session => {
    session.attendance.forEach(record => {
      const name = record.studentName;
      if (!summary[name]) summary[name] = { present: 0 };
      if (record.present) summary[name].present++;
    });
  });

  filteredSummaryData = Object.entries(summary).map(([name, { present }]) => {
    const percent = ((present / totalDays) * 100).toFixed(1);
    return { studentName: name, present, percent: parseFloat(percent) };
  });

  updateSummaryTable(filteredSummaryData);
}
  */
 //The above function updated to the below version
 function renderAttendanceSummary() {
  const classVal = document.getElementById('filterClassSummary').value;

  const filteredSessions = getFilteredSessions(s => !classVal || s.class === classVal);
  const allDates = [...new Set(filteredSessions.map(s => s.date))];
  const totalDays = allDates.length;

  const summary = {};

  filteredSessions.forEach(session => {
    session.attendance.forEach(record => {
      const name = record.studentName;
      if (!summary[name]) summary[name] = { present: 0 };
      if (record.present) summary[name].present++;
    });
  });

  // filteredSummaryData = Object.entries(summary).map(([name, { present }]) => {
  //   const percent = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : "0.0";
  //   return { studentName: name, present, percent: parseFloat(percent) };
  // });


  filteredSummaryData = Object.entries(summary).map(([name, { present }]) => {
  const percent = ((present / totalDays) * 100).toFixed(1);
  return { studentName: name, present, percent: parseFloat(percent), totalDays };
});


  updateSummaryTable(filteredSummaryData);
}




// let summarySortState = {
//   key: null,
//   ascending: false
// };

// function sortSummaryTable(key) {
//   if (summarySortState.key === key) {
//     summarySortState.ascending = !summarySortState.ascending;
//   } else {
//     summarySortState.key = key;
//     summarySortState.ascending = key === 'name'; // Default: name ascending
//   }
//   renderSummary(); // Re-render after updating sort state
// }


/*
function sortSummary(byField) {
  if (!filteredSummaryData.length) return;

  if (byField === 'percent') {
    filteredSummaryData.sort((a, b) => b.percent - a.percent);
  } else if (byField === 'studentName') {
    filteredSummaryData.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }

  updateSummaryTable(filteredSummaryData);
}
*/

//modified
function sortSummary(byField) {
  if (!filteredSummaryData.length) return;

  if (summarySortState.key === byField) {
    // Toggle ascending/descending
    summarySortState.ascending = !summarySortState.ascending;
  } else {
    summarySortState.key = byField;
    summarySortState.ascending = true; // default ascending on new column
  }

  filteredSummaryData.sort((a, b) => {
    if (byField === 'percent') {
      return summarySortState.ascending
        ? a.percent - b.percent
        : b.percent - a.percent;
    } else if (byField === 'studentName') {
      return summarySortState.ascending
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName);
    }
  });

  updateSummaryTable(filteredSummaryData);
}



// created new
function updateSummaryTable(data) {
  const rows = data.map(({ studentName, present, percent, totalDays }) => {
    return `<tr>
      <td data-label="Student">${studentName}</td>
      <td data-label= "Total Days">${totalDays}</td>
      <td data-label= "Days Present">${present}</td>
      <td data-label= "Attendance">${percent.toFixed(1)}%</td>
    </tr>`;
  });

  document.querySelector('#summaryTable tbody').innerHTML = rows.join('');
}



document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('filterClass')) {
    updateClassOptions('filterClass');
    document.getElementById('filterClass').addEventListener('change', e => updateStudentOptions('filterName', e.target.value));
    renderAttendance();
  }
  if (document.getElementById('filterClassTaught')) {
    updateClassOptions('filterClassTaught');
    updateUnitOptions('filterUnit');
    renderTaught();
  }
  if (document.getElementById('filterClassStudent')) {
    updateClassOptions('filterClassStudent');
    document.getElementById('filterClassStudent').addEventListener('change', e => updateStudentOptions('filterNameStudent', e.target.value));
    renderStudentView();
  }
  if (document.getElementById('filterClassSummary')) {
    updateClassOptions('filterClassSummary');
    renderAttendanceSummary();
  }
  if (document.getElementById('filterDateFrom')) {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById('filterDateFrom').value = today;
    document.getElementById('filterDateTo').value = today;
  }

});




//for functional navbar position with scrolling
let lastScrollTop = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    navbar.style.top = '-100px'; // hide nav
  } else {
    // Scrolling up
    navbar.style.top = '0'; // show nav
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // handle mobile bounce
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Existing setup calls (e.g., updateClassOptions(), etc.)
});
