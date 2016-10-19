# angular2-resource

How to create an authentication service + generic for RestAPI


#idea

so we have a model base service which will create the calls for our RestAPI
if ones need to call entry point /serverURL/<Model>/[get/post/delete]
he will create a model declaring the model contract then a model.service implements ModelBase<Model>
all calls will return the exact objects with obserables.
