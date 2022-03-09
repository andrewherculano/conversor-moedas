const alertErrorEl = document.querySelector('[data-js="alert-error"]')
const alertErrorMessageEl = document.querySelector('[data-js="alert-error-message"]')
const alertErrorButtonEl = document.querySelector('[data-js="alert-error-button"]')
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const conversionResultEl = document.querySelector('[data-js="conversion-result"]')
const conversionPresicionEl = document.querySelector('[data-js="conversion-precision"]')
const amountToConversionEl = document.querySelector('[data-js="amount-to-conversion"]')

let internalExchangeRate = {}

const getErrorMessage = (error) => {
  return {
    'unsupported-code': 'A moeda não existe no banco de dados',
    'malformed-request': 'O endpoint informado não é válido',
    'invalid-key': 'A chave da API não é válida',
    'inactive-account': 'Endereço de e-mail não confirmado',
    'quota-reached': 'O limite de solicitações permitidas foi atingido'
  }[error] || 'Não foi possível obter os dados'
}

const APIKey = '5c8d0f7db23a584339f95428'
const getUrl = (currency) => {
  return `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`
}

const fetchExchangeRate = async (url) => {
  try {
    const response = await fetch(url)
    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error') {
      const errorType = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorType)
    }

    return exchangeRateData
  } catch ({ message }) {
    console.log(message)

    alertErrorEl.classList.remove('display-none')
    alertErrorMessageEl.textContent = message

    alertErrorButtonEl.addEventListener('click', () => {
      alertErrorEl.classList.add('display-none')
    })
  }
}

const initializer = async () => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD'))) }

  const getOptions = (selectedCurrency) => {
    return Object.keys(internalExchangeRate.conversion_rates)
      .map((currency) => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
  }

  currencyOneEl.innerHTML = getOptions('USD')
  currencyTwoEl.innerHTML = getOptions('BRL')

  conversionPresicionEl.textContent = `1 USD igual a ${internalExchangeRate.conversion_rates[currencyTwoEl.value].toFixed(2)} BRL`
}

amountToConversionEl.addEventListener('input', (e) => {
  conversionResultEl.textContent = (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyOneEl.addEventListener('input', async (e) => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl(e.target.value))) }

  conversionResultEl.textContent = (amountToConversionEl.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
  conversionPresicionEl.textContent = `1 ${e.target.value} igual a ${internalExchangeRate.conversion_rates[currencyTwoEl.value].toFixed(2)} ${currencyTwoEl.value}`
})

currencyTwoEl.addEventListener('input', (e) => {
  conversionResultEl.textContent = (amountToConversionEl.value * internalExchangeRate.conversion_rates[e.target.value]).toFixed(2)
  conversionPresicionEl.textContent = `1 ${currencyOneEl.value} igual a ${internalExchangeRate.conversion_rates[currencyTwoEl.value].toFixed(2)} ${currencyTwoEl.value}`
})

initializer()