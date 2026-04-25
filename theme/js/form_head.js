// All participating countries (for R32 select), sorted alphabetically
const WK2026_COUNTRIES = [
    "Algerije","Argentinië","Australië","België",
    "Bosnië-Herzegovina","Brazilië","Canada","Colombia",
    "Curaçao","DR Congo","Duitsland","Ecuador",
    "Egypte","Engeland","Frankrijk","Ghana",
    "Haïti","Iran","Irak","Ivoorkust",
    "Japan","Jordanië","Kaapverdië","Kroatië",
    "Marokko","Mexico","Nederland","Nieuw-Zeeland",
    "Noorwegen","Oezbekistan","Oostenrijk","Panama",
    "Paraguay","Portugal","Qatar","Saoedi-Arabië",
    "Schotland","Senegal","Spanje","Tunesië",
    "Turkije","Tsjechië","Uruguay","Verenigde Staten",
    "Zweden","Zwitserland","Zuid-Afrika","Zuid-Korea"
];

// Round definitions: id, label, pts, slots, grid columns, placeholder, source grid id
const KO_ROUNDS = [
    { id: 'r32',  label: 'Laatste 32',   pts: 4,  slots: 32, cols: 4, ph: 'Land',          src: null,      options: WK2026_COUNTRIES },
    { id: 'r16',  label: 'Laatste 16',   pts: 8,  slots: 16, cols: 4, ph: 'Land',          src: 'r32' },
    { id: 'qf',   label: 'Kwartfinale',  pts: 16, slots: 8,  cols: 4, ph: 'Kwartfinalist', src: 'r16' },
    { id: 'sf',   label: 'Halve finale', pts: 22, slots: 4,  cols: 4, ph: 'Halve finalist',src: 'qf'  },
    { id: 'f',    label: 'Finale',       pts: 28, slots: 2,  cols: 2, ph: 'Finalist',      src: 'sf'  },
    { id: 'w',    label: 'Winnaar',      pts: 34, slots: 1,  cols: 1, ph: 'Winnaar',       src: 'f'   },
];

// Read non-empty values from a grid's selects, sorted alphabetically.
// Accepts either an element ID string or a direct DOM element reference.
function getGridValues(gridOrId) {
    const grid = (typeof gridOrId === 'string') ? document.getElementById('ko-' + gridOrId + '-grid') : gridOrId;
    if (!grid) return [];
    const values = [];
    grid.querySelectorAll('select').forEach(el => {
        const v = el.value.trim();
        if (v) values.push(v);
    });
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'nl'));
}

// Create a <select> dropdown
function createSelectField(ph, field_name, options, savedValue) {
    const sel = document.createElement('select');
    sel.classList.add('ko-input-field');
    sel.name = field_name;

    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = options.length ? ph : '— vul vorige ronde in —';
    blank.disabled = true;
    blank.selected = true;
    sel.appendChild(blank);

    options.forEach(country => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        if (country === savedValue) opt.selected = true;
        sel.appendChild(opt);
    });

    if (savedValue && options.includes(savedValue)) {
        sel.value = savedValue;
    }

    sel.addEventListener('change', () => {
        const grid = sel.closest('.ko-grid');
        refreshGridDisabled(grid);
        // Find which round this grid belongs to and only rebuild rounds after it
        const roundId = grid.id.replace('ko-', '').replace('-grid', '');
        refreshDownstreamSelects(roundId);
    });

    return sel;
}

// Disable options that are already chosen by a sibling select in the same grid
function refreshGridDisabled(grid) {
    if (!grid) return;
    const selects = Array.from(grid.querySelectorAll('select'));
    const chosen = new Set(selects.map(s => s.value).filter(v => v !== ''));

    selects.forEach(sel => {
        Array.from(sel.options).forEach(opt => {
            if (opt.value === '') return;
            opt.disabled = opt.value !== sel.value && chosen.has(opt.value);
        });
    });
}

function createRoundTitle(my_title, points_per_answer) {
    const title_element = document.createElement('h3');
    title_element.classList.add('ko-round-title');
    title_element.innerHTML = `${my_title} <span class="points">${points_per_answer}pts</span>`;
    return title_element;
}

function createGrid(width) {
    const grid = document.createElement('div');
    grid.classList.add('ko-grid');
    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    return grid;
}

// Build one round's div (grid + title), appending it to parentEl.
// Returns the grid element.
function buildRoundDiv(round, savedData, options, parentEl) {
    const div = document.createElement('div');
    const title = createRoundTitle(round.label, round.pts);
    if (round.id === 'r32') {
        const btn = document.createElement('button');
        btn.setAttribute('onclick', 'autoFillR32(event)');
        btn.innerText = 'Auto-fill top 2';
        btn.id = 'R32-autofill';
        title.appendChild(btn);
        div.appendChild(title);
        const note = document.createElement('p');
        note.classList.add('italic');
        note.innerText = 'Eerste 24: groepswinnaar/runner-up (auto-fill). Voor de overgebleven 8: de 8 beste #3-landen die jij verwacht.';
        div.appendChild(note);
    } else {
        div.appendChild(title);
    }
    const grid = createGrid(round.cols);
    grid.id = 'ko-' + round.id + '-grid';
    for (let i = 0; i < round.slots; i++) {
        grid.appendChild(createSelectField(round.ph, round.id + '-' + i, options, savedData[round.id + '-' + i]));
    }
    refreshGridDisabled(grid);
    div.appendChild(grid);
    div.dataset.roundId = round.id;
    parentEl.appendChild(div);
    return grid;
}

// Auto-fill function — fills the 24 certain R32 qualifiers (top 2 per group)
function autoFillR32(event) {
    event.preventDefault();

    const current_rankings = makeRankings();
    const r32_certain = [];
    current_rankings.forEach(group_rank => {
        r32_certain.push(group_rank[0].country);
        r32_certain.push(group_rank[1].country);
    });

    const r32_grid = document.getElementById('ko-r32-grid');
    if (r32_grid) {
        r32_grid.querySelectorAll('select').forEach((sel, i) => {
            if (i < 24) sel.value = r32_certain[i] || '';
        });
        refreshGridDisabled(r32_grid);
    }

    const autofillbtn = document.getElementById('R32-autofill');
    if (autofillbtn) autofillbtn.innerText = 'Ververs';

    refreshDownstreamSelects('r32');
}

// Confirm submit function
function confirmSubmit(e) {
    if (!confirm('Zeker weten?\nJe kan het niet meer aanpassen.\n\nWacht tot je inzending is verwerkt en je "Success" ziet, dit kan ongeveer 5-25 sec duren.')) {
        e.preventDefault();
    }
}

// Rebuild only rounds AFTER fromRoundId — leaves the changed round's DOM untouched (no scroll).
function refreshDownstreamSelects(fromRoundId) {
    const ko_input = document.getElementById('ko-input');
    if (!ko_input) return;

    const fromIdx = KO_ROUNDS.findIndex(r => r.id === fromRoundId);
    if (fromIdx === -1) return;

    // Snapshot all current values
    const savedData = {};
    document.querySelectorAll('#knockout-page select').forEach(el => {
        if (el.name && el.value) savedData[el.name] = el.value;
    });

    // Remove all round divs that come after fromRoundId
    Array.from(ko_input.querySelectorAll('[data-round-id]')).forEach(div => {
        const idx = KO_ROUNDS.findIndex(r => r.id === div.dataset.roundId);
        if (idx > fromIdx) div.remove();
    });

    // Rebuild rounds after fromIdx
    for (let i = fromIdx + 1; i < KO_ROUNDS.length; i++) {
        const round = KO_ROUNDS[i];
        const srcGrid = document.getElementById('ko-' + round.src + '-grid');
        const options = getGridValues(srcGrid);
        buildRoundDiv(round, savedData, options, ko_input);
    }

    saveFormData();
}

// Rebuild the full #ko-input div (called by updateKnockoutsPage and on full reload)
function generateKoInputFields(savedData) {
    const inputDiv = document.createElement('div');
    inputDiv.id = 'ko-input';

    let prevGrid = null;
    for (const round of KO_ROUNDS) {
        const options = round.options ? round.options : getGridValues(prevGrid);
        prevGrid = buildRoundDiv(round, savedData, options, inputDiv);
    }

    return inputDiv;
}

// Update Knockouts Page — full rebuild including standings (called by showGroup only)
function updateKnockoutsPage() {
    const savedData = {};
    const ko_page = document.getElementById('knockout-page') || null;
    if (ko_page) {
        ko_page.querySelectorAll('select').forEach(el => {
            if (el.name && el.value) savedData[el.name] = el.value;
        });
        ko_page.innerHTML = '';
    }

    const knockoutTitle = document.createElement('h3');
    knockoutTitle.classList.add('group-title');
    knockoutTitle.innerText = "Knockouts";

    const standingsDiv = document.createElement('div');
    standingsDiv.classList.add('standings');

    const rankings = makeRankings();
    rankings.forEach(grp => {
        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('table-wrapper');
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th class="country">Team</th>
                <th class="points">P</th>
                <th class="goals">D</th>
                <th class="goaldiff">SD</th>
            </tr>
        `;
        table.appendChild(thead);
        table.classList.add('group-standings');
        const tbody = document.createElement('tbody');
        grp.forEach(cntry => {
            const cntry_row = document.createElement('tr');
            cntry_row.innerHTML = `
                <td class="country">${cntry.country}</td>
                <td class="points">${cntry.points}</td>
                <td class="goals">${cntry.goals_for}:${cntry.goals_con}</td>
                <td class="goaldiff">${cntry.goal_diff > 0 ? '+' : ''}${cntry.goal_diff}</td>
            `;
            tbody.appendChild(cntry_row);
        });
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        standingsDiv.appendChild(tableWrapper);
    });

    ko_page.appendChild(knockoutTitle);
    ko_page.appendChild(standingsDiv);
    ko_page.appendChild(generateKoInputFields(savedData));
    saveFormData();
}

// Rankings generation — one ranking per group of 4 teams
function makeRankings() {
    function getPredictionsPerGroup() {
        const allGroups = [];
        const groupMatchlists = document.querySelectorAll('.group-matchlist');
        groupMatchlists.forEach(groupMatchlist => {
            const groupPreds = [];
            Array.from(groupMatchlist.children).forEach(match => {
                const homet = match.querySelector('.home-team').innerText;
                const awayt = match.querySelector('.away-team').innerText;
                const homes = match.querySelector('.home-score').value;
                const aways = match.querySelector('.away-score').value;
                const prediction = {};
                prediction[homet] = Number(homes) || 0;
                prediction[awayt] = Number(aways) || 0;
                groupPreds.push(prediction);
            });
            allGroups.push(groupPreds);
        });
        return allGroups;
    }

    function rankGroup(predictions) {
        const grpPreds = {};
        predictions.forEach(match => {
            Object.keys(match).forEach(team => {
                if (!grpPreds.hasOwnProperty(team)) {
                    grpPreds[team] = { points: 0, goals_for: 0, goals_con: 0 };
                }
            });

            const teams = Object.keys(match);
            const [teamA, teamB] = teams;
            const goalsA = match[teamA];
            const goalsB = match[teamB];

            if (goalsA === goalsB) {
                grpPreds[teamA].points += 1;
                grpPreds[teamB].points += 1;
                grpPreds[teamA].goals_for += goalsA;
                grpPreds[teamA].goals_con += goalsB;
                grpPreds[teamB].goals_for += goalsB;
                grpPreds[teamB].goals_con += goalsA;
            } else if (goalsA > goalsB) {
                grpPreds[teamA].points += 3;
                grpPreds[teamA].goals_for += goalsA;
                grpPreds[teamA].goals_con += goalsB;
                grpPreds[teamB].goals_for += goalsB;
                grpPreds[teamB].goals_con += goalsA;
            } else {
                grpPreds[teamB].points += 3;
                grpPreds[teamA].goals_for += goalsA;
                grpPreds[teamA].goals_con += goalsB;
                grpPreds[teamB].goals_for += goalsB;
                grpPreds[teamB].goals_con += goalsA;
            }
        });

        const dataArray = Object.entries(grpPreds).map(([country, stats]) => ({
            country,
            ...stats,
            goal_diff: stats.goals_for - stats.goals_con
        }));

        dataArray.sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.goal_diff !== b.goal_diff) return b.goal_diff - a.goal_diff;
            return b.goals_for - a.goals_for;
        });

        return dataArray;
    }

    const allGroupPredictions = getPredictionsPerGroup();
    return allGroupPredictions.map(grp => rankGroup(grp));
}

// Navigation functions
function showGroup(groupIndex) {
    updatePouleWinnerPlaceholder();
    const groupDivs = document.querySelectorAll('.group');
    const progress = document.getElementById('progress');
    const totalGroups = groupDivs.length;
    const currentGroup = groupIndex + 1;
    const percentage = (currentGroup / totalGroups) * 100;
    progress.style.width = percentage + '%';

    groupDivs.forEach((groupDiv, index) => {
        groupDiv.style.display = index === groupIndex ? 'block' : 'none';
    });

    updateKnockoutsPage();

    document.getElementById('prevButton').style.display = groupIndex === 0 ? 'none' : 'inline-block';
    document.getElementById('nextButton').style.display = groupIndex === groupDivs.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submitButton').style.display = groupIndex === groupDivs.length - 1 ? 'inline-block' : 'none';
}

function showPrevGroup() {
    saveFormData();
    if (currentGroupIndex > 0) {
        currentGroupIndex--;
        showGroup(currentGroupIndex);
    }
}

function showNextGroup() {
    saveFormData();
    const currentGroup = document.querySelector('.group:not([style*="none"])');
    const fields = currentGroup.querySelectorAll('input, select');
    let allFieldsFilled = true;

    fields.forEach(field => {
        if (field.value.trim() === '') {
            allFieldsFilled = false;
            field.style.outline = '1px solid #FFA500';
        } else {
            field.style.outline = '';
        }
    });

    if (allFieldsFilled && currentGroupIndex < groups.length - 1) {
        currentGroupIndex++;
        showGroup(currentGroupIndex);
    }
}

// Data persistence functions
function saveFormData() {
    const formData = {};
    document.querySelectorAll('input, select').forEach(field => {
        if (field.name) formData[field.name] = field.value;
    });
    localStorage.setItem('form_data_wk2026', JSON.stringify(formData));
}

function loadFormData() {
    console.log('Loading previous input...');
    const formData = JSON.parse(localStorage.getItem('form_data_wk2026'));
    if (formData) {
        document.querySelectorAll('input, select').forEach(field => {
            if (field.name && formData.hasOwnProperty(field.name)) {
                field.value = formData[field.name];
            }
        });
    }
    console.log('All previous input loaded.');
}

// Event listeners
document.addEventListener('loadFormDataTrigger', loadFormData);
const loadFormDataTrigger = new Event('loadFormDataTrigger');

// Placeholder update function
function updatePouleWinnerPlaceholder() {
    const winnerInputField = document.getElementsByClassName('winner-question')[0];
    if (!winnerInputField) return;
    const usernameField = document.getElementById('username');
    if (!usernameField) return;
    winnerInputField.placeholder = usernameField.value || usernameField.placeholder;
}
