# prettier-config
Prettier config

## Usage

Install the package using `npm` (or `yarn`)

```sh
npm install --save-dev @titenkov/prettier-config
```

Add the `prettier` key to your `package.json`

```diff
diff --git package.json
@@ -5,6 +5,7 @@
   "keywords": [
     "prettier"
   ],
+  "prettier": "@titenkov/prettier-config",
   "license": "MIT",
   "main": "index.js"
 ```
 
 [Check out the `prettier` documentation for more info on sharing configurations](https://prettier.io/docs/en/configuration.html#sharing-configurations).