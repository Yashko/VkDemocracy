# VkDemocracy
Automated comments moderation based on likes

еее, бот как на лентаче!

## Usage

1. Edit config.json
2. Run script`node index.js`

if you want to run script as a daemon, you can use https://github.com/Unitech/pm2


> watch - ID паблика, начинается с "-"  
> token - access_token пользователя с правами модератора  
> time - массив, как часто и с каким промежутком скрипт будет проверять комментарии. Пример: [10,30], первая проверка будет через 10 секунд, вторая через 30 (после первой)  
> likes - массив, количество лайков, которое должен иметь комментарий чтобы остаться. Пример: [5,20], во время первой проверки комментарий должен набрать 5 лайков, во время второй: 20.  
> secret - secret_key со страницы настройки callback api (в настройках паблика)  
> port - порт на котором будет запущен скрипт  
> confirm - confirmation_key со страницы настройки callback_api (в настройках паблика)  
