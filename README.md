# VkDemocracy
Automated comments moderation based on likes

еее, бот как на лентаче!

## Usage

1. Open index.js file and edit SETTINGS object.
```
watch - id of the group (starting with "-")

token - access_token of user with moderation privilegue

time - array, how many times and how often script should check comments. [10,30] means first check in 10 seconds, and second in 30 seconds. 

likes - array, should have elements number equal to time array. how much likes required to dont delete comment. [5,20] means comment need to get 5 likes on the first check, and 20 likes on the second check

secret - secret_key from callback api page (in group settings)

port - port on which script will be runned. make sure those port is open

confirm - confirmation_key from callback api page to confirm domain (in group settings)
```
2. run script `node index.js`

if you want to run script as a daemon, you can use https://github.com/Unitech/pm2
