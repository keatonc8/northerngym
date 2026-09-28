document.addEventListener('DOMContentLoaded', function () {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const deliveryDays = [1, 2, 3, 4, 5, 6];

  function getOrdinal(day) {
    if (day > 3 && day < 21) return day + 'th';

    switch (day % 10) {
      case 1: return day + 'st';
      case 2: return day + 'nd';
      case 3: return day + 'rd';
      default: return day + 'th';
    }
  }

  function formatDate(date) {
    return `${weekdays[date.getDay()]}, ${getOrdinal(date.getDate())} ${months[date.getMonth()]}`;
  }

  function parseDispatchDays(rawDays) {
    return (rawDays || '')
      .split(',')
      .map(function (value) {
        return parseInt(value, 10);
      })
      .filter(function (value) {
        return !Number.isNaN(value) && value >= 0 && value <= 6;
      });
  }

  function parseCutoffTime(rawTime) {
    const parts = (rawTime || '14:00').split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    return {
      hours: Number.isNaN(hours) ? 14 : hours,
      minutes: Number.isNaN(minutes) ? 0 : minutes
    };
  }

  function formatTime(cutoffTime) {
    const hours = String(cutoffTime.hours).padStart(2, '0');
    const minutes = String(cutoffTime.minutes).padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  function addWorkingDays(startDate, workingDaysToAdd, activeDays) {
    const result = new Date(startDate.getTime());
    result.setHours(12, 0, 0, 0);

    let remainingDays = workingDaysToAdd;

    while (remainingDays > 0) {
      result.setDate(result.getDate() + 1);

      if (activeDays.indexOf(result.getDay()) !== -1) {
        remainingDays -= 1;
      }
    }

    return result;
  }

  function getDispatchDetails(now, activeDays, cutoffTime) {
    const cutoff = new Date(now.getTime());
    cutoff.setHours(cutoffTime.hours, cutoffTime.minutes, 0, 0);

    const isDispatchDay = activeDays.indexOf(now.getDay()) !== -1;
    const canDispatchToday = isDispatchDay && now < cutoff;
    const dispatchDate = new Date(now.getTime());
    dispatchDate.setHours(12, 0, 0, 0);

    if (canDispatchToday) {
      return { canDispatchToday: true, cutoff: cutoff, dispatchDate: dispatchDate };
    }

    do {
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    } while (activeDays.indexOf(dispatchDate.getDay()) === -1);

    return { canDispatchToday: false, cutoff: cutoff, dispatchDate: dispatchDate };
  }

  function updateDeliveryBlock(block) {
    const datePrefixEl = block.querySelector('.delivery-date-prefix');
    const dateValueEl = block.querySelector('.delivery-date-value');
    const countdownPrefixEl = block.querySelector('.delivery-countdown-prefix');
    const countdownValueEl = block.querySelector('.delivery-countdown-value');
    const countdownSuffixEl = block.querySelector('.delivery-countdown-suffix');
    if (!datePrefixEl || !dateValueEl || !countdownPrefixEl || !countdownValueEl || !countdownSuffixEl) return;

    const activeDays = parseDispatchDays(block.dataset.dispatchDays);
    if (!activeDays.length) {
      block.hidden = true;
      return;
    }
    block.hidden = false;

    const cutoffTime = parseCutoffTime(block.dataset.cutoffTime);
    const leadDays = Math.max(parseInt(block.dataset.leadDays, 10) || 0, 0);
    const failsafeDays = Math.max(parseInt(block.dataset.failsafeDays, 10) || 0, 0);
    const totalLeadDays = leadDays + failsafeDays;
    const datePrefix = (block.dataset.datePrefix || 'Delivery by').trim();
    const countdownPrefix = (block.dataset.countdownPrefix || 'Order within').trim();
    const countdownSuffix = (block.dataset.countdownSuffix || 'for same-day dispatch').trim();
    const orderBeforePrefix = (block.dataset.orderBeforePrefix || 'Order before').trim();
    const orderBeforeSuffix = (block.dataset.orderBeforeSuffix || ' ').trim();

    const now = new Date();
    const dispatchDetails = getDispatchDetails(now, activeDays, cutoffTime);
    const deliveryDate = addWorkingDays(dispatchDetails.dispatchDate, totalLeadDays, deliveryDays);
    datePrefixEl.textContent = datePrefix;
    dateValueEl.textContent = formatDate(deliveryDate);

    if (dispatchDetails.canDispatchToday) {
      const diff = dispatchDetails.cutoff.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      countdownPrefixEl.textContent = countdownPrefix;
      countdownValueEl.textContent = `${hours}h ${minutes}m`;
      countdownSuffixEl.textContent = countdownSuffix;
      return;
    }

    countdownPrefixEl.textContent = orderBeforePrefix;
    countdownValueEl.textContent = '';
    countdownSuffixEl.textContent = orderBeforeSuffix;
  }

  function updateDeliveryMessages() {
    document.querySelectorAll('[data-delivery-promise]').forEach(updateDeliveryBlock);
  }

  updateDeliveryMessages();
  window.addEventListener('delivery-promise:refresh', updateDeliveryMessages);
  setInterval(updateDeliveryMessages, 60000);
});
