INSERT INTO questions(id,ownerId,title,body)
VALUES
  ('q00003','u58027206','Can anyone explain me what is node-gyp', 'Can anyone explain me what is node-gyp and why it uses my system files to build Node.JS packages.
If Ii build a node project and it used node-gyp internally.
Then I just tar that project and moved to a different system
I untar it there and try to use it
Will this approach work?')
  ;

INSERT INTO  answers(id,questionId,ownerId,answer)
VALUES
  ('a00003','q00003','u58026024','node-gyp is a tool which compiles Node.js Addons. Node.js Addons are native Node.js Modules, written in C or C++, which therefore need to be compiled on your machine. After they are compiled with tools like node-gyp, their functionality can be accessed via require(), just as any other Node.js Module.
If you do what you suggested the module would not work, you will need to compile it/build it with node-gyp on the system you moved the program to.')
;
INSERT INTO comments(id,responseId,ownerId,comment)
VALUES
  ('c00005','q00003','u58026024','It is described on its github page: github.com/nodejs/node-gyp. Basically, node-gyp is like make. It is a tool used to control the compilation process of C++ projects. Only, it is designed specifically for node.js addons (modules written in C++). So moving to a different system may work if it uses the same CPU. Moving to a different OS or CPU (for example from x86 to ARM) would not work. For Linux, moving to a different distro of different version of the same distro may or may not work. I am not 100% sure if moving to a different version of node.js would work'),
  ('c00006','q00003','u58026024','When I run yarn why node-gyp it comes back with: because node-sass, so I am sure it has other uses, but it may be in your project if you or someone you love has been diagnosed with'),
  ('c00007','q00003','u58026024','@slebetman moving to different node version would not work, not sure if that is 100% true, yet from my experience, you need to remove old node-gyp after upgrading nodejs version and during modules install it Is re-build automatically in the background.'),
  ('c00008','a00003','u58027206','@slebetman moving to different node version would not work, not sure if that is 100% true, yet from my experience, you need to remove old node-gyp after upgrading nodejs version and during modules install it Is re-build automatically in the background.'),
  ('c00009','a00003','u58027206','When I run yarn why node-gyp it comes back with: because node-sass, so I am sure it has other uses, but it may be in your project if you or someone you love has been diagnosed with');
;
INSERT INTO voteLog
VALUES
  ('u58027207','q00003',1),
  ('u58027208','q00003',1),
  ('u58027209','q00003',1),
  ('u58027210','q00003',1),
  ('u58027211','q00003',1),
  ('u58027212','q00003',1)
  ;
INSERT INTO questionTags
VALUES
  ('q00003','t00001'),
  ('q00003','t00002'),
  ('q00003','t00003')
  ;
UPDATE questions
SET votes=votes+6
WHERE id='q00003'
;
UPDATE  answers 
SET isAccepted=true
where id='a00003';
