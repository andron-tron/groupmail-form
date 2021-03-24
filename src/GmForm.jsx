import React from 'react';
import {Form, Row, Col, Button} from 'react-bootstrap';
import Autocomplete from 'react-autocomplete';
import obj2fd from 'obj2fd';

export default class GmForm extends React.Component {

	constructor(props) {
        super(props);
        var data = {data: {_id: '', 
                           group_name: '', 
                           group_divid: 0, 
                           group_note: '',
                           dest: []},
                           linked: true,
                           validated: false};
		this.state = data; 
    
    this.onChangeInput = this.onChangeInput.bind(this);
    this.checkID  = this.checkID.bind(this);
		this.onChangeRadio = this.onChangeRadio.bind(this);
		this.onChangeDivEvent = this.onChangeDivEvent.bind(this);
		this.onSetSourceEvent = this.onSetSourceEvent.bind(this);
        this.onDeleteDest = this.onDeleteDest.bind(this);
        this.onSaveData =  this.onSaveData.bind(this);
      }
  componentDidMount() {
      if(this.props.edit){
        fetch(`https://sward:4435/gm_get/${this.props.edit}`)
          .then(res => res.json())
          .then(
            (result) => {   
              // если у группы пустой список членов...
              // созданим на его месте пустой массив
              if(!result[0].dest){
                result[0].dest = [];
              }        
              this.setState({data: result[0], linked: result[0].dep_valid, validated: true });
            },
            // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
            // чтобы не перехватывать исключения из ошибок в самих компонентах.
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
          );
      }
  }

	onChangeInput(event) {
      const name = event.target.name;
	  const record = this.state.data;	// копия текущего состояния
	  record.[name] = event.target.value;
	  this.setState({ data: record});
      //this.setState({ data: {[name]: event.target.value}});

	  //console.log(this.state);
  }

  checkID(event){
    // если форма в режиме Новой записи, проверим уникальность _id
    if(!this.props.edit){
      console.log(event.target.value);
      fetch(`https://sward:4435/gm_get/${event.target.value}`)
          .then(res => res.json())
          .then(
            (result) => {   
              if(result[0]){
                event.target.className = "form-control is-invalid";
                this.setState({data: this.state.data, linked: this.state.linked, validated: false });
                return false;
              } else {
                event.target.className = "form-control is-valid";
                this.setState({data: this.state.data, linked: this.state.linked, validated: true });
                return true;
              }
            },
            (error) => {
              

            }
          );
    }
  }

	onChangeRadio(event) {
      if(event.target.value === "1"){
		  this.setState({linked: true});
	  } else {
      const record = this.state.data;
      // группа БЕЗ структурного подразделения
      record.group_divid = 0;
		  this.setState({linked: false, data: record});
	  }
	}

	onChangeDivEvent(event){
		console.log("Обработчик: " + event.name + "[" + event._id);
		const record = this.state.data; // копия текущего состояния
		record.group_divid = event.id;
		record.group_name = event.name;
		this.setState({ data: record});
		//this.setState({ data: {group_id: event.id, group_name: event.name}});
		//console.log("div_id: " + event);
	}

	onSetSourceEvent(event){
		const record = this.state.data; // копия текущего состояния
		record.dest.push({mail: event.mail, desc: event.name});

		this.setState({ data: record});
	}

  onDeleteDest(event){
        event.preventDefault();
        console.log(event.target.value + event.target.name);

      const record = this.state.data;
      record.dest.splice(event.target.name,1);
      this.setState({data: record});

    }
  onDeleteData(event){
      const record = this.state.data;

      // record.dest.splice(event.target.name,1);
      //this.setState({data: record});
  }
    onSaveData(event){
        event.preventDefault();
        if(this.state.status){
          event.stopPropagation();
          event.target.disabled = true;  
        }
        
        const record = this.state.data; // копия текущего состояния
        /* 
            Преобразуем JSON в объект formData (специальная библиотека).
            При отправке через POST JSON объекта, современный браузер инициирует
            PreFlight OPTIONS request, что значительно усложняет REST...
        */
        const formData = obj2fd(record);
        let url = 'https://sward:4435/gm_save';

		    let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        //xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;
			         if (status == 200) {
                    this.state.status = true;
                    event.target.className = "btn btn-outline-success";
                    event.target.value = "-- Сохраненно --"
                    event.target.disabled = true;  
			          } else {
                    console.error("Cannot save data");
                    event.target.className = "btn-alert";
                    this.state.status = 0;
            }
        };
        xhr.send(formData);
    }


	render() {


    return (
        <Form>
            <Form.Group>
                <Form.Label>Групповой адрес:</Form.Label>
                <Form.Control type="email" name="_id" 
                  value={this.state.data._id} 
                  onChange={this.onChangeInput} 
                  onBlur={this.checkID} 
                  placeholder="eMail адрес для Группы"/>
                <Form.Text className="invalid-tooltip">адрес УЖЕ используется</Form.Text>
                
			      </Form.Group>
           
            <Form.Group>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="linkRadio" id="linkRadio1" value="1" checked={this.state.linked} onChange={this.onChangeRadio}/>
                    <label className="form-check-label" for="linkRadio1">Группа <b>=</b> структурное подразделение</label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="linkRadio" id="linkRadio2" value="0" checked={!this.state.linked} onChange={this.onChangeRadio}/>
                    <label className="form-check-label" for="linkRadio2">просто Группа</label>
                </div>
            </Form.Group>
            
            <Form.Group>
			    { this.state.linked ? (
                  <DivisionSelect onChangeDiv={this.onChangeDivEvent} value={this.state.data.group_divid}/>
					) : (
                  <input className="form-control" name="group_name" id="group_name" type="text"  value={this.state.data.group_name} onChange={this.onChangeInput}/>
  	            )}
            </Form.Group>

            <Form.Group className="dest-group" >
                
                <Form.Label><b>Члены группы:</b></Form.Label>

                <div className="dest-list my-4">
                { this.state.data.dest ? (  
                  this.state.data.dest.map((item, index) =>
                    (          
                        <div className="dest-items row" key={index}>
                            <div className="col-10">{item.mail}[{item.desc}]</div>
                            <div className="col-2">
                                <img src="delete-sign-36.png" role="button" width="20" height="20" key={index} value={item.mail} name={index} onClick={this.onDeleteDest}></img>
                                {/* 
                                <Button variant="danger" size="sm"  key={index} value={item.mail} name={index} onClick={this.onDeleteDest}>&times;</Button>
                                */}
                            </div>
                        </div>
                    )
                  )
                ):( true )
                }
                </div>
                
                <DestSelector onSetSource={this.onSetSourceEvent}/>
            </Form.Group>
            <Form.Group>
              <Form.Label><b>Комментарий к изменению:</b></Form.Label>
              <input className="form-control" name="group_note" id="group_note" type="text" value={this.state.data.group_note} onChange={this.onChangeInput} />
            </Form.Group>  
            <Form.Group>
                <Form.Check type="checkbox" name="group_deleted" id="group_deleted" label="&nbsp;Удалить группу" onChange={this.onChangeInput} />   
            </Form.Group>

            <div className="mySubmit">
              <Button type="submit" className="btn-primary" onClick={this.onSaveData} disabled={!this.state.validated}>Сохранить</Button>
            </div>       
	    </Form>
		);
	}


}

/*
	Наименование структурного подразделения по его div_no
	однозначно криво, но пока работает.
*/
function NameOfDiv(id,array){
    for (var i=0; i < array.length; i++) {
       if (array[i]._id == id) {
           return array[i].name;
       }
    }
    return null;
   }

class DivisionSelect extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        isLoaded: false,
        items: []
      };
      this.onChange = this.onChange.bind(this);
    }
  
  
    onChange(e) {
      const div_id = e.target.value;
      //Поднимаем объект вида {id: div_id, name: div_name}
      this.props.onChangeDiv({id: div_id, name: NameOfDiv(div_id, this.state.items)});
  
    }
  
    componentDidMount() {
      fetch("https://sward:4435/divs")
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              items: result.result
            });
          },
          // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
          // чтобы не перехватывать исключения из ошибок в самих компонентах.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        );
    }
  
    render() {
      const { error, isLoaded, items } = this.state;
      if (error) {
        return <div>Ошибка: {error.message}</div>;
      } else if (!isLoaded) {
        return <div>Загрузка...</div>;
      } else {
        return (
          <select className="form-control" name="group_id" id="group_id" value={this.props.value} onChange={this.onChange}>
            {items.map(item => (
              <option value={item._id}>
                {item.short_name}({item.name.slice(0,34)+'... )'}
              </option>
            ))}
          </select>
        );
      }
    }
  }

class DestSelector extends React.Component {
	constructor(props) {
    super(props);
	  this.state = {
        value: "",
        autocompleteData: []
    };
	  this.onChange = this.onChange.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.getItemValue = this.getItemValue.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.retrieveDataAsynchronously = this.retrieveDataAsynchronously.bind(this);
	  this.onAddButtonClick = this.onAddButtonClick.bind(this);
  }

	//	Autocomplete почта/фамилия
	retrieveDataAsynchronously(searchText){
    let _this = this;
    let url = `https://sward:4435/mails?q=${searchText}`;

		let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;
			         if (status == 200) {
				             _this.setState({autocompleteData: xhr.response});
			          } else {
                console.error("Cannot load data from remote source");
            }
        };
        xhr.send();
	}

	renderItem(item, isHighlighted){
        return (
            <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                [{item.mail}] {item.name}
            </div>
        );
    }
	getItemValue(item){
        return `${item.mail}|${item.name}`;
    }

	onSelect(val){
        this.setState({value: val});
        console.log("Option from 'database' selected : ", val);
    }

	onChange(e){
        this.setState({
            value: e.target.value
        });

        /**
         * Handle the remote request with the current text !
         */
		if(this.state.value.length > 2){
			this.retrieveDataAsynchronously(this.state.value);
			//console.log("query data");
		}

    }

	onAddButtonClick(e){
		e.preventDefault();
		//Поднимаем объект вида {mail: email address, name: full name}
		let x = this.state.value.split("|");
		this.props.onSetSource({mail: x[0], name: x[1]});
    this.setState({value: ""});
	}

	render() {
        return (

        <Form.Row >
            <Autocomplete 
					   inputProps={{id: 'destination-autocomplete', class: 'form-control', placeholder: 'Фамилия или адрес...', }}
					          getItemValue={this.getItemValue}
                    items={this.state.autocompleteData}
                    renderItem={this.renderItem}
                    value={this.state.value}
                    onChange={this.onChange}
                    onSelect={this.onSelect}
                    wrapperStyle={{ width:'80%' }}
                    menuStyle={{
                      borderRadius: '3px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '6px 0',
                      fontSize: '90%',
                      position: 'fixed',
                      overflow: 'auto',
                      maxHeight: '50%', 
                    }}
            />
            {/* 
            <img src="plus-sign-36.png" role="button" onClick={this.onAddButtonClick}></img>
            */}
            
            <Button variant="outline-success" size="sm" onClick={this.onAddButtonClick}><b>&uarr;</b></Button>
            
        </Form.Row>

        
        );
    }
}
