// DataLayer push helpers for Poultje WK 2026
// All events follow the format: { event: 'pouletje.<category>.<action>', ...dimensions }
// Initialize dataLayer if GTM hasn't done so yet
window.dataLayer = window.dataLayer || [];

// ─── Helpers ────────────────────────────────────────────────────────────────

function dl_username() {
    return document.querySelector('input[name="username"]')?.value?.trim() || '(unknown)';
}

function dl_push(obj) {
    window.dataLayer.push(obj);
}

// ─── Form lifecycle ──────────────────────────────────────────────────────────

// Fired once when the form finishes building and saved data is restored
function dl_formLoaded(hadSavedData) {
    dl_push({
        event: 'pouletje.form.loaded',
        form_had_saved_data: hadSavedData,
        username: dl_username(),
    });
}

// Fired when the user enters/changes their name (debounced, on blur)
function dl_usernameSet(name) {
    dl_push({
        event: 'pouletje.form.username_set',
        username: name,
    });
}

// ─── Navigation ──────────────────────────────────────────────────────────────

// Fired every time a page becomes visible
// pageType: 'welcome' | 'group' | 'knockout' | 'bonus' | 'rules'
function dl_pageView(pageIndex, pageType, pageLabel) {
    dl_push({
        event: 'pouletje.navigation.page_view',
        page_index: pageIndex,
        page_type: pageType,
        page_label: pageLabel,
        username: dl_username(),
    });
}

// Fired when the user hits >> and validation fails (at least one field still empty)
function dl_validationFailed(pageLabel, emptyFieldNames) {
    dl_push({
        event: 'pouletje.navigation.validation_failed',
        page_label: pageLabel,
        empty_fields: emptyFieldNames,
        empty_field_count: emptyFieldNames.length,
        username: dl_username(),
    });
}

// ─── Match scores ────────────────────────────────────────────────────────────

// Fired on blur when a score input loses focus with a valid (non-empty) value
// matchId: e.g. "1", homeTeam/awayTeam from label text, homeScore/awayScore as numbers
function dl_scoreChanged(matchId, homeTeam, awayTeam, homeScore, awayScore, groupName) {
    const winner = homeScore > awayScore ? homeTeam : awayScore > homeScore ? awayTeam : 'draw';
    dl_push({
        event: 'pouletje.score.changed',
        match_id: matchId,
        group_name: groupName,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: homeScore,
        away_score: awayScore,
        predicted_winner: winner,
        total_goals: homeScore + awayScore,
        username: dl_username(),
    });
}

// Fired when all 6 scores in a group are non-zero (group "completed")
function dl_groupCompleted(groupName, matchCount) {
    dl_push({
        event: 'pouletje.score.group_completed',
        group_name: groupName,
        match_count: matchCount,
        username: dl_username(),
    });
}

// ─── Knockout selections ─────────────────────────────────────────────────────

// Fired when a KO select changes
// roundId: 'r32'|'r16'|'qf'|'sf'|'f'|'w'
// slotIndex: 0-based position within the round
function dl_koSelectionChanged(roundId, roundLabel, slotIndex, selectedCountry) {
    dl_push({
        event: 'pouletje.knockout.selection_changed',
        round_id: roundId,
        round_label: roundLabel,
        slot_index: slotIndex,
        selected_country: selectedCountry,
        username: dl_username(),
    });
}

// Fired after auto-fill R32 button is used
function dl_r32AutoFilled(filledCount) {
    dl_push({
        event: 'pouletje.knockout.r32_autofilled',
        filled_slots: filledCount,
        username: dl_username(),
    });
}

// Fired when all slots in a KO round are filled
function dl_koRoundCompleted(roundId, roundLabel, selections) {
    dl_push({
        event: 'pouletje.knockout.round_completed',
        round_id: roundId,
        round_label: roundLabel,
        selections: selections,  // array of country names
        username: dl_username(),
    });
}

// ─── Bonus questions ─────────────────────────────────────────────────────────

// Fired on blur when a bonus input loses focus with a non-empty value
function dl_bonusAnswered(questionId, questionText, answer) {
    dl_push({
        event: 'pouletje.bonus.answered',
        question_id: questionId,
        question_text: questionText,
        answer: answer,
        username: dl_username(),
    });
}

// ─── Form submission ─────────────────────────────────────────────────────────

// Fired when the user clicks Inleveren and confirms
function dl_formSubmitted() {
    // Snapshot completeness
    const allInputs = document.querySelectorAll('input[name], select[name]');
    let filled = 0, empty = 0;
    allInputs.forEach(f => f.value.trim() ? filled++ : empty++);

    dl_push({
        event: 'pouletje.form.submitted',
        total_fields: allInputs.length,
        filled_fields: filled,
        empty_fields: empty,
        username: dl_username(),
    });
}

// Fired when the user cancels the submit confirm dialog
function dl_formSubmitCancelled() {
    dl_push({
        event: 'pouletje.form.submit_cancelled',
        username: dl_username(),
    });
}
