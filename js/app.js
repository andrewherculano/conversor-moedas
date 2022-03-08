const alertErrorEl = document.querySelector('[data-js="alert-error"]')
const alertErrorMessageEl = document.querySelector('[data-js="alert-error-message"]')
const alertErrorButtonEl = document.querySelector('[data-js="alert-error-button"]')

const url = 'https://v6.exchangerate-api.com/v6/5c8d0f7db23a584339f95428/latest/USD'

const getErrorMessage = (error) => {
  return {
    'unsupported-code': 'A moeda não existe no banco de dados',
    'malformed-request': 'O endpoint informado não é válido',
    'invalid-key': 'A chave da API não é válida',
    'inactive-account': 'Endereço de e-mail não confirmado',
    'quota-reached': 'O limite de solicitações permitidas foi atingido'
  }[error] || 'Não foi possível obter os dados'
}

const fetchExchangeRate = async () => {
  try {
    const response = await fetch(url)
    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error') {
      const errorType = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorType)
    }

    console.log(exchangeRateData)
  } catch ({ message }) {
    console.log(message)

    alertErrorEl.classList.remove('display-none')
    alertErrorMessageEl.textContent = message

    alertErrorButtonEl.addEventListener('click', () => {
      alertErrorEl.classList.add('display-none')
    })
  }
}

fetchExchangeRate()