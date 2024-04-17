let currentGroupIndex = 0;
let groups = [];

document.addEventListener("DOMContentLoaded", function() {
    fetch('matches.json')
        .then(response => response.json())
        .then(data => {
            const groupList = document.getElementById('groups');
            groups = Object.values(data.groups);

            const startDiv = document.createElement('div');
            startDiv.classList.add('group');
            const startTitle = document.createElement('h3');
            startTitle.classList.add('group-title');
            startTitle.innerText = "Welkom bij het EURO24 poultje!";
            const nameInputFieldSpan = document.createElement('span');
            nameInputFieldSpan.classList.add('username');
            nameInputFieldSpan.innerHTML = `
                <label for="username">Naam: </label>
                <input id="username" type="text" placeholder="Ronald Koeman" name="username">
            `
            
            startDiv.appendChild(startTitle);
            startDiv.appendChild(nameInputFieldSpan);
            groupList.appendChild(startDiv);

            // add sections for score entries
            groups.forEach((group, index) => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('group');
                groupDiv.style.display = 'none';
                const groupTitle = document.createElement('h3');
                groupTitle.classList.add('group-title');
                groupTitle.innerText = `Groep ${String.fromCharCode(65 + index)}`;
                const groupPointsTotal = document.createElement('p');
                groupPointsTotal.innerText = 'Max per wedstrijd: 7pt';
                const groupPointsSplit = document.createElement('p');
                groupPointsSplit.innerText = 'Winnaar: +3pt | Marge: +2pt | Uitslag: +2pt';
                groupPointsSplit.classList.add('italic');
                const groupMatchlist = document.createElement('ul');
                groupMatchlist.classList.add('group-matchlist');
                group.forEach(match => {
                    const matchLi = document.createElement('li');
                    matchLi.classList.add('match');
                    matchLi.innerHTML = `
                        <label for="${match.id}-home" class="home-team">${match.homeTeam}</label>
                        <input type="number" id="${match.id}-home" name="${match.id}-home" class="home-score" min="0" value="0" required>
                        <span class="score-separator">-</span>
                        <input type="number" id="${match.id}-away" name="${match.id}-away" class="away-score" min="0" value="0" required>
                        <label for="${match.id}-away" class="away-team">${match.awayTeam}</label>
                    `;
                    groupMatchlist.appendChild(matchLi);
                });
                const groupWarning = document.createElement('p');
                groupWarning.innerHTML = '<span class="bold">Let op:</span> de speler die de meeste gelijke spelen voorspelt krijgt 10 extra punten.';
                groupDiv.appendChild(groupTitle);
                groupDiv.appendChild(groupPointsTotal);
                groupDiv.appendChild(groupPointsSplit);
                groupDiv.appendChild(groupMatchlist);
                groupDiv.appendChild(groupWarning);
                groupList.appendChild(groupDiv);
            });

            groups.push({'Welkom': 'username'});

            // add section for knockouts
            const ko_page_temp = document.createElement('div');
            ko_page_temp.classList.add('group');
            ko_page_temp.id = 'knockout-page';
            ko_page_temp.style.display = 'none';
            groupList.appendChild(ko_page_temp);
            updateKnockoutsPage()
            groups.push({"knockout": "page"});
            
            // add sections for bonus
            fetch('bonus.json')
                .then(response => response.json())
                .then(data => {
                    groups.push(Object.values(data.bonus))
                    const bonusDiv = document.createElement('div');
                    bonusDiv.classList.add('group')
                    bonusDiv.style.display = 'none';
                    const bonusTitle = document.createElement('h3');
                    bonusTitle.classList.add('group-title');
                    bonusTitle.innerText = 'Bonusvragen'
                    const questionsList = document.createElement('ul');
                    questionsList.classList.add('bonus-questions-list');
                    data.bonus.io.forEach(question => {
                        const questionLi = document.createElement('li');
                        questionLi.classList.add('question');
                        questionLi.innerHTML = `
                            <label for="question-${question.id}">${question.question} <span class="points">${question.points}</span> </label>
                            <input type="text" id="question-${question.id}" ${question.id === "4" ? 'class="winner-question"' : ''} name="question-${question.id}" placeholder="${question.placeholder}" required>
                            <br>
                            <span class="note">${question.note}</span>
                        `;
                        questionsList.appendChild(questionLi);
                    });
                    data.bonus.incremental.forEach(question => {
                        const questionLi = document.createElement('li');
                        questionLi.classList.add('question');
                        questionLi.innerHTML = `
                            <label for="question-${question.id}">${question.question} <span class="points">${question.points}pt per ${question.event}</label>
                            <input type="text" id="question-${question.id}" name="question-${question.id}" placeholder="${question.placeholder}" required>
                        `;
                        questionsList.appendChild(questionLi);
                    });
                    data.bonus.range.forEach(question => {
                        const questionLi = document.createElement('li');
                        questionLi.classList.add('question');
                        questionLi.innerHTML = `
                            <label for="question-${question.id}">${question.question}</label>
                            <input type="text" id="question-${question.id}" placeholder="${question.placeholder}" name="question-${question.id}" required>
                            <br>
                            <span class="note">-${question.decrease}pt voor iedere ${question.deviation} meer of minder</span>
                            <br>
                            <span class="note">${question.note}</span>
                        `;                    
                        questionsList.appendChild(questionLi);
                    });
                    bonusDiv.appendChild(bonusTitle);
                    bonusDiv.appendChild(questionsList);
                    groupList.appendChild(bonusDiv);
                    const bonusRulesDiv = document.createElement('div');
                    bonusRulesDiv.classList.add('group')
                    bonusRulesDiv.style.display = 'none';
                    groups.push({'bonus': 'rules'})
                    const bonusRulesTitle = document.createElement('h3');
                    bonusRulesTitle.classList.add('group-title');
                    bonusRulesTitle.innerText = 'Bonusregels'
                    const bonusRulesList = document.createElement('ul');
                    bonusRulesList.classList.add('bonus-questions-list');
                    data.bonus.rules.forEach(bonusRule => {
                        const ruleLi = document.createElement('li');
                        ruleLi.classList.add('question');
                        ruleLi.innerHTML = `
                            <span class='bonus-rule'>${bonusRule.rule}</span>
                            <span class="explanation">${bonusRule.explanation}</span>
                            <span class="exception">${bonusRule.exception}</span>
                        `;
                        bonusRulesList.appendChild(ruleLi);
                    })
                    bonusRulesDiv.appendChild(bonusRulesTitle);
                    bonusRulesDiv.appendChild(bonusRulesList);
                    groupList.appendChild(bonusRulesDiv);
                    document.dispatchEvent(loadFormDataTrigger);
                });
            // Call saveFormData when input field is clicked
            const allInputElements = document.querySelectorAll('input');
            allInputElements.forEach(element => {
                element.addEventListener('click', saveFormData);
            });
        })
        .catch(error => console.error('Error:', error));
});
