// Utility functions
function createInputField(ph, field_name, width = '95%') {
    const field = document.createElement('input');
    field.classList.add('ko-input-field');
    field.type = 'text';
    field.name = field_name;
    field.placeholder = ph;
    field.style.width = width;
    return field;
}

function createRoundTitle(my_title, points_per_answer) {
    const title_element = document.createElement('h3');
    title_element.classList.add('ko-round-title');
    title_element.innerHTML = `${my_title} <span class="points">${points_per_answer}pts</span>`;
    return title_element;
}

function createGrid(width) {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.width = '100%';
    grid.style.gap = '2px';
    grid.style.gridTemplateColumns = `repeat(${width}, auto)`;
    return grid;
}

// Auto-fill function
function autoFillKOR16(event) {
    event.preventDefault();

    function generateAutoFilledPlayoff(ranks) {
        const grid_temp = document.createElement('div');
        let i = 0

        ranks.forEach(group_rank => {
            let i = 0
            group_rank.forEach(team => {
                if (i > 7 && i < 24) {
                    const playoff_inputfield = createInputField("Land", "playoff-" + Number(i + 1));
                    playoff_inputfield.setAttribute('value', team.country);
                    grid_temp.appendChild(playoff_inputfield);
                }
                i++;
            })
        })

        return grid_temp.innerHTML;
    }

    function generateAutoFilledKOR16(ranks) {
        const grid_temp = document.createElement('div');
        let i = 0

        ranks.forEach(group_rank => {
            let i = 0
            group_rank.forEach(team => {
                if (i < 8) {
                    const r16_inputfield = createInputField("Land", "r16-" + i);
                    r16_inputfield.setAttribute('value', team.country);
                    grid_temp.appendChild(r16_inputfield);
                }
                i++;
            })
            
            for (i = 8; i < 16; i++) {
                const open_field = createInputField("Land", "r16-" + i);
                grid_temp.appendChild(open_field)
            }
        })

        return grid_temp.innerHTML;
    }

    const current_rankings = makeRankings();
    const playoff_fields = generateAutoFilledPlayoff(current_rankings);
    const playoff_grid = document.getElementById('playoff-grid');
    playoff_grid.innerHTML = playoff_fields;
    const r16_fields = generateAutoFilledKOR16(current_rankings);
    const r16_grid = document.getElementById('ko-r16-grid');
    r16_grid.innerHTML = r16_fields;

    const autofillbtn = document.getElementById('KOR16-autofill');
    autofillbtn.innerText = 'Ververs';
}

// Confirm submit function
function confirmSubmit(e) {
    console.log(e);
    if (!confirm('Zeker weten?\nJe kan het niet meer aanpassen.\n\nWacht tot je inzending is verwerkt en je "Success" ziet, dit kan ongeveer 5-25 sec duren.')) {
        e.preventDefault();
    }
}

// Update Knockouts Page
function updateKnockoutsPage() {
    function generateInputFields() {
        const inputDiv = document.createElement('div');
        inputDiv.id = 'ko-input';

        // KO play-off
        const playoff_div = document.createElement('div');
        const playoff_title = createRoundTitle('KO Playoff (9-24)', '8');
        const autoFillButton = document.createElement('button');
        autoFillButton.setAttribute('onclick', 'autoFillKOR16(event)');
        autoFillButton.innerText = 'Auto-fill';
        autoFillButton.id = "KOR16-autofill"
        playoff_title.appendChild(autoFillButton);
        playoff_div.appendChild(playoff_title);
        const playoff_grid = createGrid(4);
        playoff_grid.id = 'playoff-grid';
        for (let i = 9; i < 25; i++) {
            const playoff_country = createInputField("Land", "playoff-" + i);
            playoff_grid.appendChild(playoff_country);
        }
        playoff_div.appendChild(playoff_grid);
        inputDiv.appendChild(playoff_div);


        // Round 16
        const r16_div = document.createElement('div');
        const r16_title = createRoundTitle('Laatste 16', '16');
        r16_title.appendChild(autoFillButton);
        r16_div.appendChild(r16_title);
        const r16_grid = createGrid(4);
        r16_grid.id = 'ko-r16-grid';
        for (let i = 0; i < 16; i++) {
            const r16_country = createInputField("Land", "r16-" + i);
            r16_grid.appendChild(r16_country);
        }
        r16_div.appendChild(r16_grid);
        inputDiv.appendChild(r16_div);

        // Quarterfinals
        const qf_div = document.createElement('div');
        qf_div.appendChild(createRoundTitle('Kwartfinale', '32'));
        const qf_grid = createGrid(4);
        for (let i = 0; i < 8; i++) {
            const qf_country = createInputField("Kwartfinalist", "qf-" + i);
            qf_grid.appendChild(qf_country);
        }
        qf_div.appendChild(qf_grid);
        inputDiv.appendChild(qf_div);

        // Semifinals
        const sf_div = document.createElement('div');
        sf_div.appendChild(createRoundTitle('Halve finale', '48'));
        const sf_grid = createGrid(4);
        for (let i = 0; i < 4; i++) {
            const sf_country = createInputField("Halve finalist", "sf-" + i);
            sf_grid.appendChild(sf_country);
        }
        sf_div.appendChild(sf_grid);
        inputDiv.appendChild(sf_div);

        // Finals
        const f_div = document.createElement('div');
        f_div.appendChild(createRoundTitle('Finale', '60'));
        const f_grid = createGrid(2);
        for (let i = 0; i < 2; i++) {
            const f_country = createInputField("Finalist", "f-" + i, "98%");
            f_grid.appendChild(f_country);
        }
        f_div.appendChild(f_grid);
        inputDiv.appendChild(f_div);

        // Winner
        const w_div = document.createElement('div');
        w_div.appendChild(createRoundTitle('Winnaar', '72'));
        const w_grid = createGrid(1);
        const w_field = createInputField("Winnaar", "w-0", "100%");
        w_grid.appendChild(w_field);
        w_div.appendChild(w_grid);
        inputDiv.appendChild(w_div);

        return inputDiv;
    }

    const ko_input = document.getElementById('ko-input') || null;
    const ko_page = document.getElementById('knockout-page') || null;

    if (ko_page) {
        ko_page.innerHTML = '';
    }

    const knockoutTitle = document.createElement('h3');
    knockoutTitle.innerText = "Knockouts";
    const standingsDiv = document.createElement('div');
    standingsDiv.classList.add('standings');

    const rankings = makeRankings();
    console.log(rankings);
    rankings.forEach(grp => {
        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('table-wrapper');
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <th class="country">Land</th>
            <th class="points">P</th>
            <th class="goals">G</th>
            <th class="goaldiff">GD</th>
        `;
        table.appendChild(thead);
        table.classList.add('group-standings')
        const tbody = document.createElement('tbody');
        grp.forEach(cntry => {
            const cntry_row = document.createElement('tr');
            cntry_row.innerHTML = `
                <td class="country">${cntry.country}</td>
                <td class="points">${cntry.points}</td>
                <td class="goals">${cntry.goals_for}:${cntry.goals_con}</td>
                <td class="goaldiff">${cntry.goal_diff}</td>
            `;
            tbody.appendChild(cntry_row);
        });
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        standingsDiv.appendChild(tableWrapper);
    });

    ko_page.appendChild(knockoutTitle);
    ko_page.appendChild(standingsDiv);

    if (ko_input) {
        ko_page.appendChild(ko_input);
    } else {
        ko_page.appendChild(generateInputFields(rankings));
    }
}

// Rankings generation functions
function makeRankings() {
    function getPredictions() {
        const predictions = [];
        const groupElements = document.querySelectorAll('.group ul');
        Array.from(groupElements).forEach(groupMatchlist => {
            if (groupMatchlist.classList.contains('group-matchlist')) {
                Array.from(groupMatchlist.children).forEach(match => {
                    const homet = match.querySelector('.home-team').innerText;
                    const awayt = match.querySelector('.away-team').innerText;
                    const homes = match.querySelector('.home-score').value;
                    const aways = match.querySelector('.away-score').value;
                    const prediction = {}
                    prediction[homet] = Number(homes) || 0;
                    prediction[awayt] = Number(aways) || 0;
                    predictions.push(prediction);
                });
            }
        });
        return predictions;
    }

    function rankGroup(predictions) {
        function sortGroup(group_to_sort) {
            const dataArray = Object.entries(group_to_sort).map(([country, stats]) => ({
                country,
                ...stats,
                goal_diff: stats.goals_for - stats.goals_con
            }));

            dataArray.sort((a, b) => {
                if (a.points !== b.points) {
                    return b.points - a.points;
                }
                if (a.goal_diff !== b.goal_diff) {
                    return b.goal_diff - a.goal_diff;
                }
                return b.goals_for - a.goals_for;
            });

            return dataArray.map(({ country, points, goals_for, goals_con, goal_diff }) => ({
                country,
                points,
                goals_for,
                goals_con,
                goal_diff
            }));
        }

        const grpPreds = {};
        predictions.forEach(match => {
            Object.keys(match).forEach(team => {
                if (!grpPreds.hasOwnProperty(team)) {
                    grpPreds[team] = { "points": 0, "goals_for": 0, "goals_con": 0 };
                }
            });

            const maxGoals = Math.max(...Object.values(match));
            const minGoals = Math.min(...Object.values(match));

            if (maxGoals == minGoals) {
                Object.keys(match).forEach(team => {
                    grpPreds[team].points += 1;
                    grpPreds[team].goals_for += maxGoals;
                    grpPreds[team].goals_con += maxGoals;
                });
            } else {
                Object.entries(match).forEach(([team, goals]) => {
                    if (goals == maxGoals) {
                        grpPreds[team].points += 3;
                        grpPreds[team].goals_for += maxGoals;
                        grpPreds[team].goals_con += minGoals;
                    } else {
                        grpPreds[team].goals_for += minGoals;
                        grpPreds[team].goals_con += maxGoals;
                    }
                });
            }
        });

        console.log(grpPreds);
        const rnk = sortGroup(grpPreds);
        return rnk
    }

    const predictions = getPredictions();
    const ranking = rankGroup(predictions)
    return [ranking];
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
    const textInputFields = currentGroup.querySelectorAll('input');
    let allFieldsFilled = true;

    textInputFields.forEach(field => {
        if (field.value.trim() === '') {
            allFieldsFilled = false;
            field.style.border = field.type === 'text' ? '1px solid #FFA500' : '1px solid #FF0000';
        } else {
            field.style.border = '';
        }
    });

    if (allFieldsFilled && currentGroupIndex < groups.length - 1) {
        currentGroupIndex++;
        showGroup(currentGroupIndex);
    }
}

// Data persistence functions
function saveFormData() {
    console.log('Saving form data...');
    const formData = {};
    const inputFields = document.querySelectorAll('input');
    inputFields.forEach(field => {
        formData[field.name] = field.value;
    });
    localStorage.setItem('form_data', JSON.stringify(formData));
}

function loadFormData() {
    console.log('Loading previous input...');
    const formData = JSON.parse(localStorage.getItem('form_data'));
    if (formData) {
        const inputFields = document.querySelectorAll('input');
        inputFields.forEach(field => {
            if (formData.hasOwnProperty(field.name)) {
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
    console.log(winnerInputField);
    const username = document.getElementById('username').value || document.getElementById('username').placeholder;
    winnerInputField.placeholder = username;
}
