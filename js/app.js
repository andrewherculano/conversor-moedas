const alertErrorEl = document.querySelector('[data-js="alert-error"]')
const alertErrorMessageEl = document.querySelector('[data-js="alert-error-message"]')
const alertErrorButtonEl = document.querySelector('[data-js="alert-error-button"]')
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const conversionResultEl = document.querySelector('[data-js="conversion-result"]')
const conversionPresicionEl = document.querySelector('[data-js="conversion-precision"]')
const amountToConversionEl = document.querySelector('[data-js="amount-to-conversion"]')
const switchCurrencyButton = document.querySelector('[data-js="switch-currency"]')

const showAlertError = (message) => {
  console.log(message)

  alertErrorEl.classList.remove('display-none')
  alertErrorMessageEl.textContent = message

  alertErrorButtonEl.addEventListener('click', () => {
    alertErrorEl.classList.add('display-none')
  })
}

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => {
      return exchangeRate
    },
    setExchangeRate: (newExchangeRate) => {
      if (!newExchangeRate.conversion_rates) {
        showAlertError('O objeto precisa ter uma propriedade "conversion_rates"')
        return
      }

      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

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

    return state.setExchangeRate(exchangeRateData)
  } catch ({ message }) {
    showAlertError(message)
  }
}

const getOptions = (selectedCurrency, conversion_rates) => {
  const selectedAttribute = (currency) => {
    return currency === selectedCurrency ? 'selected' : ''
  }

  const getOptionsAsArray = (currency) => {
    return `<option ${selectedAttribute(currency)}>${currency}</option>`
  }

  return Object.keys(conversion_rates)
    .map(getOptionsAsArray)
    .join('')
}

const getMultipliedExchangeRate = (conversion_rates) => {
  const currencyTwoValue = conversion_rates[currencyTwoEl.value]
  const amountToConversionValue = amountToConversionEl.value

  return (amountToConversionValue * currencyTwoValue).toFixed(2)
}

const getNotRoundedExchangeRate = (conversion_rates) => {
  const currencyTwoValue = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} igual a ${currencyTwoValue.toFixed(3)} ${currencyTwoEl.value}`
}

const showConvertedCurrencies = ({ conversion_rates }) => {
  conversionResultEl.textContent = getMultipliedExchangeRate(conversion_rates)
  conversionPresicionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const showInitialInfo = ({ conversion_rates }) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

  conversionPresicionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const initializer = async () => {
  const url = getUrl('USD')
  const exchangeRate = await fetchExchangeRate(url)

  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitialInfo(exchangeRate)
  }
}

const getSwitchCurrency = () => {
  const currencyOne = currencyOneEl.value
  const currencyTwo = currencyTwoEl.value

  currencyOneEl.value = currencyTwo
  currencyTwoEl.value = currencyOne
}

const handleAmountToConversionResult = () => {
  const { conversion_rates } = state.getExchangeRate()
  conversionResultEl.textContent = getMultipliedExchangeRate(conversion_rates)
}

const handleCurrencyOneInput = async (e) => {
  const url = getUrl(e.target.value)
  const exchangeRate = await fetchExchangeRate(url)

  showConvertedCurrencies(exchangeRate)
}

const handleCurrencyTwoInput = () => {
  const exchangeRate = state.getExchangeRate()
  showConvertedCurrencies(exchangeRate)
}

const handleSwitchCurrencyButton = async () => {
  getSwitchCurrency()

  const url = getUrl(currencyOneEl.value)
  const exchangeRate = await fetchExchangeRate(url)

  showConvertedCurrencies(exchangeRate)
}

amountToConversionEl.addEventListener('input', handleAmountToConversionResult)
currencyOneEl.addEventListener('input', handleCurrencyOneInput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoInput)
switchCurrencyButton.addEventListener('click', handleSwitchCurrencyButton)

initializer()