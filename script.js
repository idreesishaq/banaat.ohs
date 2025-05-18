function getFilteredSessions(filterFunc) {
  return sessions.filter(filterFunc).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderAttendance() {
  const classVal = document.getElementById('filterClass').value;
  const nameVal = document.getElementById('filterName').value;
  const dateVal = document.getElementById('filterDate').value;

  const rows = [];
  const summary = {};

  getFilteredSessions(s => {
    return (!classVal || s.class === classVal) &&
      (!dateVal || s.date === dateVal);
  }).forEach(session => {
    session.attendance.forEach(record => {
      if (!nameVal || record.studentName === nameVal) {
        const symbol = record.present
          ? '<span class="present">✓</span>'
          : '<span class="absent">✗</span>';
        rows.push(`<tr><td>${session.date}</td><td>${session.class}</td><td>${record.studentName}</td><td>${symbol}</td></tr>`);

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

  document.querySelector('#summaryTable tbody').innerHTML = summaryRows.join("");
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
    return `<tr><td>${s.date}</td><td>${s.class}</td><td>${s.unit}</td><td>${s.exercise}</td><td>${s.taughtAmount}</td><td>${s.homework}</td><td>${s.remarks}</td></tr>`;
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
      return `<tr><td>${session.date}</td><td>${session.class}</td><td>${student.studentName}</td><td>${symbol}</td><td>${session.taughtAmount}</td><td>${session.homework}</td></tr>`;
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


function renderSummary() {
  const classVal = document.getElementById('filterClassSummary').value;
  const sessionsForClass = sessions.filter(s => !classVal || s.class === classVal);
  const totalDays = [...new Set(sessionsForClass.map(s => s.date))].length;

  const summary = {};

  sessionsForClass.forEach(session => {
    session.attendance.forEach(({ studentName, present }) => {
      if (!summary[studentName]) summary[studentName] = { present: 0 };
      if (present) summary[studentName].present++;
    });
  });

  // const rows = Object.entries(summary).map(([name, { present }]) => {
  //   const percent = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : "0.0";
  //   return `<tr><td>${name}</td><td>${totalDays}</td><td>${present}</td><td>${percent}%</td></tr>`;
  // });

  //modified instead of above
  const sortedEntries = Object.entries(summary).sort(([aName, aVal], [bName, bVal]) => {
  if (summarySortState.key === 'percent') {
    const aPct = (aVal.present / totalDays);
    const bPct = (bVal.present / totalDays);
    return summarySortState.ascending ? aPct - bPct : bPct - aPct;
  } else if (summarySortState.key === 'name') {
    return summarySortState.ascending
      ? aName.localeCompare(bName)
      : bName.localeCompare(aName);
  }
  return 0; // No sorting
});

const summaryRows = sortedEntries.map(([name, { present }]) => {
  const percent = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : "0.0";
  return `<tr><td>${name}</td><td>${totalDays}</td><td>${present}</td><td>${percent}%</td></tr>`;
});
//modified till here



  document.querySelector('#summaryTable tbody').innerHTML = summaryRows.join("");
  updateClassOptions('filterClassSummary');

}


let summarySortState = {
  key: null,
  ascending: false
};

function sortSummaryTable(key) {
  if (summarySortState.key === key) {
    summarySortState.ascending = !summarySortState.ascending;
  } else {
    summarySortState.key = key;
    summarySortState.ascending = key === 'name'; // Default: name ascending
  }
  renderSummary(); // Re-render after updating sort state
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
  renderSummary();
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
