#! /bin/bash

cat <<EOF > .git/hooks/pre-commit

npm test

if [ \$? != 0 ]; then
  echo "\n Tests are failing ...\n"
  exit 1;
fi;

npm run lint

if [ \$? != 0 ]; then 
  echo "\nLint errors ...\n"
  exit 1;
fi;

EOF

chmod +x .git/hooks/pre-commit;

cat <<EOF > .git/hooks/pre-push

npm test

if [ \$? != 0 ];
  then echo "\n Tests are failing ...\n";
  exit 1;
fi;

npm run lint

if [ \$? != 0 ]; then 
  echo "\nLint errors ...\n"
  exit 1;
fi;


EOF

chmod +x .git/hooks/pre-push

cat <<EOF > .git/hooks/commit-msg

cat \$1 | head -1 | grep -E "^\|#[0-9]+\|[a-zA-Z/]+\|.+$"

if [ \$? != 0 ]; then 
  echo "\nCommit message error ... \n|#<Issue number>|<name1>/<name2>|<heading>\n"
  exit 1;
fi;

EOF

chmod +x .git/hooks/commit-msg
