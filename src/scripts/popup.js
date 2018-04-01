$(function () {
  $('body').on('click', '#app-link', function () {
    chrome.tabs.create({url: $(this).attr('href')})
    return false
  })
})
