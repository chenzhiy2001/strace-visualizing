# strace-visualizing

安装`strace`:`sudo apt install strace`

安装`b3`:`sudo npm i -g b3-strace-parser`

`npm run build`



## trash

`strace -f -o output.txt <your_script.sh>`

`cat output.txt | b3 > output.json`

这个json格式尚不正确，需要修正：
```sh
sed -i 's/$/,/' output.json
sed -i '1s/^/[ /' output.json
echo ] >> output.json
```

然后我们就得到了正确的json文件。

