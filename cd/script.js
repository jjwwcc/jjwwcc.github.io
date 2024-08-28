// 倒计时功能
function updateCountdown() {
    const targetDate = new Date('2027-10-15');
    const today = new Date();
    const timeDifference = targetDate - today;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    document.getElementById('countdown').textContent = `距离大学申请截止日还有 ${daysRemaining} 天`;
}

// 进度条功能
function updateProgress(id, valueId) {
    const range = document.getElementById(id);
    const valueDisplay = document.getElementById(valueId);

    range.addEventListener('input', function () {
        valueDisplay.textContent = `${range.value}%`;
        localStorage.setItem(id, range.value);
    });

    const storedValue = localStorage.getItem(id);
    if (storedValue) {
        range.value = storedValue;
        valueDisplay.textContent = `${storedValue}%`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    updateProgress('activity1', 'value1');
    updateProgress('activity2', 'value2');
    updateProgress('activity3', 'value3');
});
