export function Time_NumToText(num) {
  const min = Math.floor(num / 60);
  const sec = num % 60;
  return `${min.toString().padStart(2, '0')}:${sec
    .toString()
    .padStart(2, '0')}`;
}
export const nameRegex = /^[\p{L}\s'.-]{2,50}$/u;
export const phoneRegex = /^\d{10}$/;
export const emailRegex = /^[\w\d]{1,}@([\w\d]{1,}.){1,}[\w\d]{1,}$/;
export function formatMoney(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
export function buildQueryStringFromObject(queryString) {
  return new URLSearchParams(queryString).toString();
}
