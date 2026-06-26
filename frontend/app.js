// Theme toggle
const saved = localStorage.getItem('ipl_theme') || 'dark';
document.documentElement.setAttribute('data-theme', saved);
document.getElementById('theme-icon').className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ipl_theme', next);
    document.getElementById('theme-icon').className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

async function predict() {
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    const venue = document.getElementById('venue').value;
    const toss_winner = document.getElementById('toss_winner').value;
    const toss_decision = document.getElementById('toss_decision').value;

    if (team1 === team2) {
        showError('Team 1 and Team 2 cannot be the same! Please select different teams.');
        return;
    }

    hideError();
    showLoading(true);
    document.getElementById('result').style.display = 'none';

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({team1, team2, venue, toss_winner, toss_decision})
        });

        const data = await response.json();
        showLoading(false);

        if (data.error) {
            showError(data.error);
            return;
        }

        displayResult(data.prediction);

    } catch (err) {
        showLoading(false);
        showError('Cannot connect to server — is the server running?');
    }
}

function displayResult(p) {
    const t1Win = p.team1_win_probability > p.team2_win_probability;
    const winnerTeam = t1Win ? p.team1 : p.team2;
    const winnerProb = t1Win ? p.team1_win_probability : p.team2_win_probability;

    document.getElementById('result').innerHTML = `
        <div class="result-title"><i class="fa-solid fa-trophy"></i> Prediction Result</div>

        <div class="winner-banner">
            <div class="label">Predicted Winner</div>
            <div class="team"><i class="fa-solid fa-medal"></i> ${winnerTeam} (${winnerProb}%)</div>
        </div>

        <div class="prob-section">
            <div class="prob-labels">
                <span class="t1">${p.team1}</span>
                <span class="t2">${p.team2}</span>
            </div>
            <div class="prob-bar">
                <div class="prob-fill1" style="width:${p.team1_win_probability}%">${p.team1_win_probability}%</div>
                <div class="prob-fill2" style="width:${p.team2_win_probability}%">${p.team2_win_probability}%</div>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-box">
                <div class="stat-label"><i class="fa-solid fa-clock-rotate-left"></i> ${p.team1} Win Rate</div>
                <div class="stat-value">${p.team1_win_rate_historical}%</div>
            </div>
            <div class="stat-box">
                <div class="stat-label"><i class="fa-solid fa-clock-rotate-left"></i> ${p.team2} Win Rate</div>
                <div class="stat-value">${p.team2_win_rate_historical}%</div>
            </div>
        </div>

        <div class="h2h-box">
            <div class="stat-label"><i class="fa-solid fa-people-arrows"></i> Head-to-Head — ${p.team1} win rate vs ${p.team2}</div>
            <div class="stat-value">${p.head_to_head}%</div>
        </div>
    `;
    document.getElementById('result').style.display = 'block';
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('btn').disabled = show;
    document.getElementById('btn').innerHTML = show
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Predicting...'
        : '<i class="fa-solid fa-wand-magic-sparkles"></i> Predict Winner';
}

function showError(msg) {
    const e = document.getElementById('error');
    e.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + msg;
    e.style.display = 'flex';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function updateTossWinnerOptions() {
    const team1 = document.getElementById('team1').value;
    const team2 = document.getElementById('team2').value;
    const tossWinnerSelect = document.getElementById('toss_winner');

    tossWinnerSelect.innerHTML = `
        <option value="${team1}">${team1}</option>
        <option value="${team2}">${team2}</option>
    `;
}

// Page load hone pe aur team change hone pe update karo
document.getElementById('team1').addEventListener('change', updateTossWinnerOptions);
document.getElementById('team2').addEventListener('change', updateTossWinnerOptions);

// Initial load pe bhi call karo
updateTossWinnerOptions();