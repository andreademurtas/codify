uname_a=$(uname -a)
str_to_contain="aws"
if [[ $uname_a == *"$str_to_contain"* ]]; then
  export HOST_REDIRECT="https://www.codify.rocks"
else
  export HOST_REDIRECT="http://localhost"
fi
