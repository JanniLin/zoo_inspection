'use strict'

export class ZooInspector {
  constructor(imageRecognitionSystem, inspectionLog) {
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionLog = inspectionLog;
  }

  inspect(zoo) {
    const inspection = new Inspection(zoo, this.imageRecognitionSystem);
    inspection.runInspection();
    this.inspectionLog.log(inspection.inspectionStatuses);
  }
}

class Inspection {
  constructor(zoo, imageRecognitionSystem) {
    this.zoo = zoo;
    this.imageRecognitionSystem = imageRecognitionSystem;
    this.inspectionStatuses = [];
    this.zooWarningStatus = false;
  }

  runInspection() {
    this.inspectEnclosuresAndAnimals();
    this.reportZooStatus();
  }

  inspectEnclosuresAndAnimals() {
    this.zoo.getEnclosures().forEach(enclosure => {
      this.inspectEnclosure(enclosure);
      this.inspectAnimal(enclosure);
    });
  }

  reportZooStatus() {
    const zooStatus = this.zooWarningStatus ? 'WARNING' : 'OK';
    this.reportStatus('ZOO', this.zoo.getId(), zooStatus);

  }



  reportEnclosureWarningStatus(enclosure) {
    this.reportStatus('ENCLOSURE', enclosure.getId(), 'WARNING');
  }

  reportAnimalWarningStatus(animal) {
    this.reportStatus('ANIMAL', animal.getName(), 'WARNING');
  }

  reportStatus(objectName, objectId, status) {
    this.inspectionStatuses.push(`${objectName}#${objectId}#${status}`);
  }

  inspectEnclosure(enclosure) {
    const enclosureImage = this.zoo.capturePictureOf(enclosure);
    const enclosureStatus = this.imageRecognitionSystem.recognizeEnclosureStatus(enclosure, enclosureImage);
    if (this.isNotSafeEnclosure(enclosureStatus)) {
      this.respondToNotSafeEnclosure(enclosure);
      this.reportNotSafeEnclosureStatus(enclosure);
    }
  }

  respondToNotSafeEnclosure(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestSecurityTo(enclosure);
    this.zoo.requestMaintenanceCrewTo(enclosure);
  }

  reportNotSafeEnclosureStatus(enclosure) {
    this.reportEnclosureWarningStatus(enclosure);
    this.zooWarningStatus = true;
  }

  isNotSafeEnclosure(enclosureStatus) {
    return !enclosureStatus.isEnclosureSafe();
  }

  inspectAnimal(enclosure) {
    const animalImage = this.zoo.capturePictureOf(enclosure.getAnimal());
    const animalStatus = this.imageRecognitionSystem.recognizeAnimalStatus(enclosure.getAnimal(), animalImage);
    if (animalStatus.isAnimalSick()) {
      this.respondToSickAnimal(enclosure);
      this.reportSickAnimalStatus(enclosure.getAnimal());
    }
  }

  reportSickAnimalStatus(animal) {
    this.reportAnimalWarningStatus(animal);
    this.zooWarningStatus = true;
  }

  respondToSickAnimal(enclosure) {
    this.zoo.closeEnclosure(enclosure);
    this.zoo.requestVeterinaryTo(enclosure.getAnimal());
  }

}