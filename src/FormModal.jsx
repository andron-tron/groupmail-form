import React from 'react';
import {Modal, Button} from 'react-bootstrap';
import GmForm from './GmForm.jsx';

export default class FormModal extends React.Component{
    constructor(props) {
		super(props);
		this.state = {show: false, editMode: this.props.edit};
        this.modalLocalClose = this.modalLocalClose.bind(this);
	}

  modalLocalClose() {
    this.props.close();
    this.setState({show: false})
  }
  
  render(){

    if(this.props.show){
          this.state = {show: true};
    }

    return(
      <Modal show={this.state.show} onHide={this.modalLocalClose}>
      <Modal.Header closeButton>
         <Modal.Title>{this.props.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
         <GmForm edit={this.props.edit}/>
      </Modal.Body>
        <Modal.Footer>
         <Button variant="secondary" onClick={this.modalLocalClose}>
           Закончить
         </Button>
        </Modal.Footer>
      </Modal>
    )
  }

}