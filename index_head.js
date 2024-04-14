
function autoFillKOR16() {
    function generateAutoFilledKOR16(ranks) {
        function createInputField(ph) {
            const field = document.createElement('input');
            field.classList.add('ko-input-field');
            field.type = 'text';
            field.placeholder = ph;
            field.style.width = '95%';
            return field;
        }

        const autofillbtn = document.getElementById('KOR16-autofill');
        autofillbtn.innerText = 'Ververs';

        const grid_temp = document.createElement('div');

        ranks.forEach(group_rank => {
            const r16_inputfield_1 = createInputField("Land");
            r16_inputfield_1.setAttribute('value',group_rank[0].country);
            const r16_inputfield_2 = createInputField("Land");
            console.log(group_rank[0].country);
            r16_inputfield_2.setAttribute('value',group_rank[1].country);
            console.log(r16_inputfield_1);
            grid_temp.appendChild(r16_inputfield_1);
            grid_temp.appendChild(r16_inputfield_2);
            console.log(grid_temp);
        });

        for (let i = 0; i < 4; i++) {
            const r16_wildcard = createInputField("Land");
            grid_temp.appendChild(r16_wildcard);
        }

        return grid_temp.innerHTML;
    }

    current_rankings = makeRankings();

    r16_fields = generateAutoFilledKOR16(current_rankings);


    const grid = document.getElementById('ko-r16-grid');

    grid.innerHTML = r16_fields;

}

function confirmSubmit(e) {
    if (!confirm('Zeker weten?')) {
        e.preventDefault();
    }
}

function updateKnockoutsPage() {
    function generateInputFields() {
        function createRoundTitle(my_title) {
            const title_element = document.createElement('h3');
            title_element.classList.add('ko-round-title');
            title_element.innerText = my_title;
            return title_element;
        }

        function createInputField(ph) {
            const field = document.createElement('input');
            field.classList.add('ko-input-field');
            field.type = 'text';
            field.placeholder = ph;
            field.style.width = '95%';
            return field;
        }

        function createGrid(width) {
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.width = '100%';
            grid.style.gap = '2px';
            grid.style.gridTemplateColumns = `repeat(${width}, auto)`;
            return grid;
        }

        const inputDiv = document.createElement('div');
        inputDiv.id = 'ko-input';
        const r16_div = document.createElement('div');
        const r16_title = createRoundTitle('Laatste 16');
        r16_div.appendChild(r16_title);
        const autoFillButton = document.createElement('button');
        autoFillButton.setAttribute('onclick','autoFillKOR16()');
        autoFillButton.innerText = 'Auto-fill';
        autoFillButton.id = "KOR16-autofill"
        r16_title.appendChild(autoFillButton);
        r16_div.appendChild(r16_title);
        const r16_grid = createGrid(4);
        r16_grid.id = 'ko-r16-grid';
        const qf_div = document.createElement('div');
        qf_div.appendChild(createRoundTitle('Kwartfinale'));
        const qf_grid = createGrid(4);
        const sf_div = document.createElement('div');
        sf_div.appendChild(createRoundTitle('Halve finale'));
        const sf_grid = createGrid(4);
        const f_div = document.createElement('div');
        f_div.appendChild(createRoundTitle('Finale'));
        const f_grid = createGrid(2);
        const w_div = document.createElement('div');
        w_div.appendChild(createRoundTitle('Winnaar'));
        const w_grid = createGrid(1);
        for (let i = 0; i < 16; i++) {
            const r16_country = createInputField("Land");
            r16_grid.appendChild(r16_country);
        }
        r16_div.appendChild(r16_grid);
        for (let i = 0; i < 8; i++) {
            const qf_country = createInputField("Kwartfinalist");
            qf_grid.appendChild(qf_country);
        }
        qf_div.appendChild(qf_grid);
        for (let i = 0; i < 4; i++) {
            const sf_country = createInputField("Halve finalist");
            sf_grid.appendChild(sf_country);
        }
        sf_div.appendChild(sf_grid);
        for (let i = 0; i < 2; i++) {
            const f_country = createInputField("Finalist");
            f_country.style.width = "98%";
            f_grid.appendChild(f_country);
        }
        f_div.appendChild(f_grid);
        w_field = createInputField("Winnaar");
        w_field.style.width = "100%";
        w_grid.appendChild(w_field);
        w_div.appendChild(w_grid);

        inputDiv.appendChild(r16_div);
        inputDiv.appendChild(qf_div);
        inputDiv.appendChild(sf_div);
        inputDiv.appendChild(f_div);
        inputDiv.appendChild(w_div);

        return inputDiv;
    }

    ko_input = document.getElementById('ko-input') || null;

    ko_page = document.getElementById('knockout-page') || null;
    if (ko_page) {
        ko_page.innerHTML = '';
    }

    const knockoutTitle = document.createElement('h3');
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
            <th class="country">Land</td>
            <th class="points">P</td>
            <th class="goals">G</td>
            <th class="goaldiff">GD</td>
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
        })
        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        standingsDiv.appendChild(tableWrapper);
    })
    ko_page.appendChild(knockoutTitle);
    ko_page.appendChild(standingsDiv);

    if (ko_input) {
        ko_page.appendChild(ko_input);
    } else {
        ko_page.appendChild(generateInputFields(rankings));
    }
}

function makeRankings() {
    function getGroupsPredictions() {
        var predictions = [];
        var groupElements = document.querySelectorAll('.group ul');
        Array.from(groupElements).forEach(groupMatchlist => {
            if (groupMatchlist.classList.contains('group-matchlist')) {
                var group_predictions = [];
                Array.from(groupMatchlist.children).forEach(match => {
                    var homet = match.querySelector('.home-team').innerText;
                    var awayt = match.querySelector('.away-team').innerText;
                    var homes = match.querySelector('.home-score').value;
                    var aways = match.querySelector('.away-score').value;
                    var prediction = {}
                    prediction[homet] = Number(homes) || 0;
                    prediction[awayt] = Number(aways) || 0;
                    group_predictions.push(prediction);
                })
                predictions.push(group_predictions);
            }
        })
        return predictions
    }

    function rankGroups(predictions) {
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
            
            const result = dataArray.map(({ country, points, goals_for, goals_con, goal_diff }) => ({
                country,
                points,
                goals_for,
                goals_con,
                goal_diff
            }));
            return result
        }
        var allGroups = [];
        predictions.forEach(grp => {
            var grpPreds = {};
            grp.forEach(match => {
                // set country key in grpPreds if not there yet
                Object.keys(match).forEach(country => {
                    if (!grpPreds.hasOwnProperty(country)) {
                        grpPreds[country] = {"points": 0, "goals_for": 0, "goals_con": 0};
                    }
                })

                // get max and min goals of predicted game
                const maxGoals = Math.max(...Object.values(match));
                const minGoals = Math.min(...Object.values(match));

                // check for winner and award points accordingly
                if (maxGoals == minGoals) {
                    // draw
                    Object.keys(match).forEach(country => {
                        grpPreds[country].points += 1;
                        grpPreds[country].goals_for += maxGoals;
                        grpPreds[country].goals_con += maxGoals;
                    })
                } else {
                    // any team won
                    Object.entries(match).forEach(([country, goals]) => {
                        if (goals == maxGoals) {
                            grpPreds[country].points += 3;
                            grpPreds[country].goals_for += maxGoals;
                            grpPreds[country].goals_con += minGoals;
                        } else {
                            grpPreds[country].goals_for += minGoals;
                            grpPreds[country].goals_con += maxGoals;
                        }
                    })
                }
            })
            const sorted_grpPreds = sortGroup(grpPreds);
            allGroups.push(sorted_grpPreds);
        })
        return allGroups
    }

    preds = getGroupsPredictions();
    rankings = rankGroups(preds);

    return rankings
}

function showGroup(groupIndex) {
    const groupDivs = document.querySelectorAll('.group');
    const progress = document.getElementById('progress');
    const totalGroups = groupDivs.length;
    const currentGroup = groupIndex + 1;
    const percentage = (currentGroup / totalGroups) * 100;
    progress.style.width = percentage + '%';

    const username = document.getElementById('username').value || document.getElementById('username').placeholder
    groupDivs.forEach((groupDiv, index) => {
        if (index === groupIndex) {
            groupDiv.style.display = 'block';
        } else {
            groupDiv.style.display = 'none';
        }
    });

    updateKnockoutsPage()

    if (groupIndex === 0) {
        document.getElementById('prevButton').style.display = 'none';
    } else {
        document.getElementById('prevButton').style.display = 'inline-block';
    }

    if (groupIndex === groupDivs.length - 1) {
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('submitButton').style.display = 'inline-block';
    } else {
        document.getElementById('nextButton').style.display = 'inline-block';
        document.getElementById('submitButton').style.display = 'none';
    }
}

function showPrevGroup() {
    if (currentGroupIndex > 0) {
        currentGroupIndex--;
        showGroup(currentGroupIndex);
    }
}

function showNextGroup() {
    if (currentGroupIndex < groups.length - 1) {
        currentGroupIndex++;
        showGroup(currentGroupIndex);
    }
}